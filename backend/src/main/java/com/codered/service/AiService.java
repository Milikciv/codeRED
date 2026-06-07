package com.codered.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final long CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
    private final ConcurrentHashMap<String, Object> cache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> cacheTime = new ConcurrentHashMap<>();

    @SuppressWarnings("unchecked")
    private <T> T fromCache(String key) {
        Long t = cacheTime.get(key);
        if (t != null && System.currentTimeMillis() - t < CACHE_TTL_MS)
            return (T) cache.get(key);
        return null;
    }

    private void toCache(String key, Object value) {
        cache.put(key, value);
        cacheTime.put(key, System.currentTimeMillis());
    }

    // 1. Generate the Early Warning Forecast Block
    @SuppressWarnings("unchecked")
    public Map<String, Object> generateEarlyWarning(String stockSummary, String demandTrends) {
        // Fixed key so all filter variations share the same cached result within the TTL window
        String cacheKey = "earlyWarning:global";
        Map<String, Object> cached = fromCache(cacheKey);
        if (cached != null) return cached;

        String prompt = "You are an AI for a blood bank system. Analyze the following data and output ONLY raw JSON (no markdown, no backticks).\n"
                + "Data: Stock: " + stockSummary + " | Demand: " + demandTrends + "\n"
                + "Generate a risk assessment JSON with these exact keys: 'message' (string), 'confidence' (integer 0-100), and 'recommendation' (string).";

        String aiResponse = callGeminiApi(prompt);

        try {
            String cleanJson = aiResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            Map<String, Object> result = objectMapper.readValue(cleanJson, Map.class);
            if (!result.containsKey("message")) return null;
            toCache(cacheKey, result);
            return result;
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini JSON: " + e.getMessage());
            return null;
        }
    }

    // 2. Generate Donor Outreach Variants
    @SuppressWarnings("unchecked")
    public List<String> generateDonorMessages(String bloodType, String shortfallContext) {
        String cacheKey = "donorMessages:" + bloodType;
        List<String> cached = fromCache(cacheKey);
        if (cached != null) return cached;

        String prompt = "You are an urgent communication AI for a blood bank. Output ONLY a raw JSON array of strings (no markdown).\n"
                + "Task: We have a critical shortfall of " + bloodType + " blood. Context: " + shortfallContext + ".\n"
                + "Generate 3 distinct, empathetic, and urgent SMS message variants to send to past donors.";

        String aiResponse = callGeminiApi(prompt);

        try {
            String cleanJson = aiResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            List<String> result = objectMapper.readValue(cleanJson, List.class);
            toCache(cacheKey, result);
            return result;
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini Messages: " + e.getMessage());
            return List.of(
                "Urgent: We need " + bloodType + " donors today. Please help!",
                "Your " + bloodType + " blood can save a life today. Book an appointment.",
                "Blood bank is running low on " + bloodType + ". Please consider donating."
            );
        }
    }

    // 3. Generate Recommended Drive Reasoning
    @SuppressWarnings("unchecked")
    public Map<String, Object> generateRecommendedDriveReasoning(
            String location, String bloodType, Integer eligibleDonors,
            Integer highResponseDonors, Integer pastSuccessRate, String hotspotContext) {
        String cacheKey = "driveReasoning:" + location + "|" + bloodType;
        Map<String, Object> cached = fromCache(cacheKey);
        if (cached != null) return cached;

        String prompt = "You are an AI analyst for a blood bank donation drive recommendation system. Output ONLY raw JSON (no markdown, no backticks).\n"
                + "Analyze the following data and generate compelling reasoning for why this location is ideal for a donation drive.\n"
                + "Data:\n"
                + "  Location: " + location + "\n"
                + "  Blood Type Needed: " + bloodType + "\n"
                + "  Eligible Donors: " + eligibleDonors + "\n"
                + "  High Response Donors: " + highResponseDonors + "\n"
                + "  Past Success Rate: " + pastSuccessRate + "%\n"
                + "  Context: " + hotspotContext + "\n\n"
                + "Generate a JSON object with exactly these keys:\n"
                + "  'reasons' (array of objects with 'label' and 'detail' - generate 3-4 reasons)\n"
                + "  'narrative' (string - a compelling 2-3 sentence summary of why this location/timing is ideal)";

        String aiResponse = callGeminiApi(prompt);

        try {
            String cleanJson = aiResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            Map<String, Object> result = objectMapper.readValue(cleanJson, Map.class);
            if (!result.containsKey("reasons") || !result.containsKey("narrative")) return null;
            toCache(cacheKey, result);
            return result;
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini Drive Reasoning: " + e.getMessage());
            return null;
        }
    }

    // The core HTTP engine to talk to Gemini
    private String callGeminiApi(String fullPrompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // Gemini requires the API key in the URL query string
        String urlWithKey = apiUrl + "?key=" + apiKey;

        // Build Gemini's required JSON request body
        Map<String, Object> textPart = Map.of("text", fullPrompt);
        Map<String, Object> parts = Map.of("parts", List.of(textPart));
        Map<String, Object> requestBody = Map.of("contents", List.of(parts));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(urlWithKey, entity, String.class);
            
            // Dig deep into Gemini's JSON response to extract the actual text
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            return rootNode.path("candidates").get(0)
                           .path("content")
                           .path("parts").get(0)
                           .path("text").asText();
        } catch (Exception e) {
            System.err.println("Gemini API Call failed: " + e.getMessage());
            return "{}"; 
        }
    }
}