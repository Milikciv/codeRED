package com.codered.controller;

import com.codered.service.AiService;
import com.codered.service.ForecastService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List; // Added this import
import java.util.Map;

@RestController
@RequestMapping("/api/forecast")
public class ForecastController {

    private final ForecastService forecastService;
    private final AiService aiService; // Added AiService

    public ForecastController(ForecastService forecastService, AiService aiService) {
        this.forecastService = forecastService;
        this.aiService = aiService;
    }

    // Existing Forecast Endpoint
    @GetMapping
    public ResponseEntity<Map<String, Object>> getForecast(@RequestParam(required = false) String bloodType) {
        return ResponseEntity.ok(forecastService.buildForecast(bloodType));
    }

    // NEW Endpoint for Gemini-generated SMS variants
    @GetMapping("/outreach-messages")
    public ResponseEntity<List<String>> getAiDonorMessages(
            @RequestParam String bloodType, 
            @RequestParam String context) {
        
        List<String> dynamicMessages = aiService.generateDonorMessages(bloodType, context);
        return ResponseEntity.ok(dynamicMessages);
    }
}
