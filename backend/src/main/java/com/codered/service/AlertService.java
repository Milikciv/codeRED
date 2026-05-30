package com.codered.service;

import com.codered.model.Alert;
import com.codered.model.User;
import com.codered.model.enums.UserRole;
import com.codered.repository.AlertRepository;
import com.codered.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;

    public List<Alert> getAlerts(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        if (user.getRole() == UserRole.HSA) {
            return alertRepository.findByDismissedFalseOrderByCreatedAtDesc();
        }
        return alertRepository.findByHospitalAndDismissedFalseOrderByCreatedAtDesc(user.getHospital());
    }

    public void dismissAlert(Long id) {
        Alert alert = alertRepository.findById(id).orElseThrow();
        alert.setDismissed(true);
        alertRepository.save(alert);
    }
}
