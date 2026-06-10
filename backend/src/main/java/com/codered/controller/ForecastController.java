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
            @RequestParam(defaultValue = "30") int historyDays,
            @RequestParam(defaultValue = "60") int forecastDays,
            @RequestParam(defaultValue = "false") boolean refresh) {
        return ResponseEntity.ok(forecastService.buildForecast(bloodType, historyDays, forecastDays, refresh));
    }

    @GetMapping("/outreach-messages")
    public ResponseEntity<List<String>> getAiDonorMessages(
            @RequestParam String driveCode,
            @RequestParam(defaultValue = "false") boolean refresh) {
        return ResponseEntity.ok(aiService.generateDonorMessages(driveCode, refresh));
    }
}
