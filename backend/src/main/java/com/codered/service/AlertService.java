package com.codered.service;

import com.codered.model.Alert;
import com.codered.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;

    public List<Alert> getAlerts(String email) {
        return alertRepository.findByDismissedFalseOrderByCreatedAtDesc();
    }

    public void dismissAlert(Long id) {
        Alert alert = alertRepository.findById(id).orElseThrow();
        alert.setDismissed(true);
        alertRepository.save(alert);
    }
}
