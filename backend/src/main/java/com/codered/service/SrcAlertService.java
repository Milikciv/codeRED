package com.codered.service;

import com.codered.repository.SrcAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SrcAlertService {

    private final SrcAlertRepository srcAlertRepository;

    public List<Map<String, Object>> getSrcAlerts() {
        return srcAlertRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(a -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("id",                a.getAlertCode());
                m.put("bloodType",         a.getBloodType());
                m.put("severity",          a.getSeverity());
                m.put("forecastedShortage", a.getForecastedShortage());
                m.put("shortageWindow",    a.getShortageWindow());
                m.put("recommendedAction", a.getRecommendedAction());
                m.put("receivedAt",        a.getReceivedAt());
                m.put("status",            a.getStatus());
                return m;
            })
            .collect(Collectors.toList());
    }
}
