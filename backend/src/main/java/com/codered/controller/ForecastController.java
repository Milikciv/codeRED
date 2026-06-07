package com.codered.controller;

import com.codered.service.AiService;
import com.codered.service.ForecastService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forecast")
@RequiredArgsConstructor
public class ForecastController {

    private final ForecastService forecastService;
    private final AiService aiService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getForecast(
            @RequestParam(required = false) String bloodType,
            @RequestParam(defaultValue = "14") int historyDays) {
        return ResponseEntity.ok(forecastService.buildForecast(bloodType, historyDays));
    }

    @GetMapping("/outreach-messages")
    public ResponseEntity<List<String>> getAiDonorMessages(
            @RequestParam String bloodType,
            @RequestParam String context) {
        return ResponseEntity.ok(aiService.generateDonorMessages(bloodType, context));
    }
}
