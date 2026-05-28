package com.codered.controller;

import com.codered.model.Alert;
import com.codered.model.User;
import com.codered.model.enums.UserRole;
import com.codered.repository.AlertRepository;
import com.codered.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertRepository alertRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Alert>> getAlerts(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        if (user.getRole() == UserRole.HSA) {
            return ResponseEntity.ok(alertRepository.findByDismissedFalseOrderByCreatedAtDesc());
        } else {
            return ResponseEntity.ok(alertRepository.findByHospitalAndDismissedFalseOrderByCreatedAtDesc(user.getHospital()));
        }
    }

    @PatchMapping("/{id}/dismiss")
    public ResponseEntity<Void> dismissAlert(@PathVariable Long id) {
        Alert alert = alertRepository.findById(id).orElseThrow();
        alert.setDismissed(true);
        alertRepository.save(alert);
        return ResponseEntity.ok().build();
    }
}
