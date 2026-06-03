package com.codered.controller;

import com.codered.service.ForecastService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/forecast")
public class ForecastController {

    private final ForecastService forecastService;

    public ForecastController(ForecastService forecastService) {
        this.forecastService = forecastService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getForecast() {
        return ResponseEntity.ok(forecastService.buildForecast());
    }
}