package com.codered.controller;

import com.codered.dto.SendAlertRequest;
import com.codered.model.Alert;
import com.codered.service.AlertService;
import com.codered.service.SrcAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;
    private final SrcAlertService srcAlertService;

    @GetMapping
    public ResponseEntity<List<Alert>> getAlerts(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(alertService.getAlerts(userDetails.getUsername()));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    @PostMapping
    public ResponseEntity<Alert> sendAlert(@RequestBody SendAlertRequest request) {
        return ResponseEntity.ok(alertService.sendAlert(request));
    }

    @PatchMapping("/{id}/dismiss")
    public ResponseEntity<Void> dismissAlert(@PathVariable Long id) {
        alertService.dismissAlert(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/src")
    public ResponseEntity<List<Map<String, Object>>> getSrcAlerts() {
        return ResponseEntity.ok(srcAlertService.getSrcAlerts());
    }
}
