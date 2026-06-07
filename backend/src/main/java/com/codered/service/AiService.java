package com.codered.service;

import com.codered.model.AiEarlyWarning;
import com.codered.model.DonationDrive;
import com.codered.repository.AiEarlyWarningRepository;
import com.codered.repository.DonationDriveRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final AiEarlyWarningRepository aiEarlyWarningRepository;
    private final DonationDriveRepository donationDriveRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // 1. Generate the Early Warning Forecast Block
    @SuppressWarnings("unchecked")
    public Map<String, Object> generateEarlyWarning(String stockSummary, String demandTrends, boolean forceRefresh) {
        if (!forceRefresh) {
            AiEarlyWarning stored = aiEarlyWarningRepository.findById(1L).orElse(null);
            if (stored != null && stored.getMessage() != null) {
                return Map.of(
                    "message",        stored.getMessage(),
                    "confidence",     stored.getConfidence(),
                    "recommendation", stored.getRecommendation()
                );
            }
        }

        String prompt = "You are an AI for a blood bank system. Analyze the following data and output ONLY raw JSON (no markdown, no backticks).\n"
                + "Data: Stock: " + stockSummary + " | Demand: " + demandTrends + "\n"
                + "Generate a risk assessment JSON with these exact keys: 'message' (string), 'confidence' (integer 0-100), and 'recommendation' (string).";

        String aiResponse = callGeminiApi(prompt);

        try {
            String cleanJson = aiResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            Map<String, Object> result = objectMapper.readValue(cleanJson, Map.class);
            if (!result.containsKey("message")) return null;

            AiEarlyWarning row = aiEarlyWarningRepository.findById(1L).orElse(new AiEarlyWarning());
            row.setMessage((String) result.get("message"));
            row.setConfidence((Integer) result.get("confidence"));
            row.setRecommendation((String) result.get("recommendation"));
            row.setGeneratedAt(LocalDateTime.now());
            aiEarlyWarningRepository.save(row);

            return result;
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini early warning JSON: " + e.getMessage());
            return null;
        }
    }

    // 2. Generate Donor Outreach Variants — tied to a specific DonationDrive
    @SuppressWarnings("unchecked")
    public List<String> generateDonorMessages(String driveCode, boolean forceRefresh) {
        DonationDrive drive = donationDriveRepository.findByDriveCode(driveCode)
                .orElseThrow(() -> new IllegalArgumentException("Drive not found: " + driveCode));

        if (!forceRefresh && drive.getAiMessagesJson() != null) {
            try {
                return objectMapper.readValue(drive.getAiMessagesJson(), List.class);
            } catch (Exception e) {
                System.err.println("Failed to deserialize stored donor messages: " + e.getMessage());
            }
        }

        String bloodType = drive.getBloodType() != null ? drive.getBloodType() : "O+";
        String shortfallContext = drive.getShortfall() != null
                ? "Expected shortfall of " + drive.getShortfall() + " units"
                : "Critical blood shortage";

        String prompt = "You are an urgent communication AI for a blood bank. Output ONLY a raw JSON array of strings (no markdown).\n"
                + "Task: We have a critical shortfall of " + bloodType + " blood. Context: " + shortfallContext + ".\n"
                + "Generate 3 distinct, empathetic, and urgent SMS message variants to send to past donors.";

        String aiResponse = callGeminiApi(prompt);

        try {
            String cleanJson = aiResponse.replaceAll("```json", "").replaceAll("```", "").trim();
            List<String> result = objectMapper.readValue(cleanJson, List.class);
            drive.setAiMessagesJson(objectMapper.writeValueAsString(result));
            drive.setAiMessagesAt(LocalDateTime.now());
            donationDriveRepository.save(drive);
            return result;
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini donor messages: " + e.getMessage());
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
            Integer highResponseDonors, Integer pastSuccessRate, String hotspotContext,
            boolean forceRefresh) {
        // Reasoning is stored directly on RecommendedDrive via RecommendationReasoningService
        // This method always calls Gemini; persistence is handled by the caller
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
            return result;
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini drive reasoning: " + e.getMessage());
            return null;
        }
    }

    private String callGeminiApi(String fullPrompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String urlWithKey = apiUrl + "?key=" + apiKey;

        Map<String, Object> textPart = Map.of("text", fullPrompt);
        Map<String, Object> parts = Map.of("parts", List.of(textPart));
        Map<String, Object> requestBody = Map.of("contents", List.of(parts));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(urlWithKey, entity, String.class);
            JsonNode rootNode = objectMapper.readTree(response.getBody());
            return rootNode.path("candidates").get(0)
                           .path("content")
                           .path("parts").get(0)
                           .path("text").asText();
        } catch (Exception e) {
            System.err.println("Gemini API call failed: " + e.getMessage());
            return "{}";
        }
    }
}
