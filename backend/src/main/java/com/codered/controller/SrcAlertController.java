package com.codered.controller;

import com.codered.repository.SrcAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/src-alerts")
@RequiredArgsConstructor
public class SrcAlertController {

    private final SrcAlertRepository srcAlertRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getSrcAlerts() {
        List<Map<String, Object>> result = srcAlertRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(a -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id", a.getAlertCode());
                m.put("bloodType", a.getBloodType());
                m.put("severity", a.getSeverity());
                m.put("forecastedShortage", a.getForecastedShortage());
                m.put("shortageWindow", a.getShortageWindow());
                m.put("recommendedAction", a.getRecommendedAction());
                m.put("receivedAt", a.getReceivedAt());
                m.put("status", a.getStatus());
                return m;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
