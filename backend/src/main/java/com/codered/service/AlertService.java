package com.codered.service;

import com.codered.dto.AlertRequest;
import com.codered.model.Alert;
import com.codered.model.User;
import com.codered.model.enums.UserRole;
import com.codered.repository.AlertRepository;
import com.codered.repository.HospitalRepository;
import com.codered.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final SesNotificationService sesNotificationService;

    public List<Alert> getAlerts(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        if (user.getRole() == UserRole.HSA) {
            return alertRepository.findByDismissedFalseOrderByCreatedAtDesc();
        }
        return alertRepository.findByHospitalAndDismissedFalseOrderByCreatedAtDesc(user.getHospital());
    }

    public Alert createAlert(AlertRequest request) {
        Alert alert = new Alert();
        alert.setTitle(request.getTitle());
        alert.setMessage(request.getMessage());
        alert.setPriority(request.getPriority());
        alert.setLocation(request.getLocation());
        alert.setDismissed(false);
        if (request.getHospitalId() != null) {
            alert.setHospital(hospitalRepository.findById(request.getHospitalId()).orElseThrow());
        }
        Alert saved = alertRepository.save(alert);

        sesNotificationService.publishAlert(saved);
        return saved;
    }

    public void dismissAlert(Long id) {
        Alert alert = alertRepository.findById(id).orElseThrow();
        alert.setDismissed(true);
        alertRepository.save(alert);
    }
}
