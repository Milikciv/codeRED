package com.codered.controller;

import com.codered.dto.AlertRequest;
import com.codered.model.Alert;
import com.codered.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    public ResponseEntity<List<Alert>> getAlerts(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(alertService.getAlerts(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<Alert> createAlert(@RequestBody AlertRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(alertService.createAlert(request));
    }

    @PatchMapping("/{id}/dismiss")
    public ResponseEntity<Void> dismissAlert(@PathVariable Long id) {
        alertService.dismissAlert(id);
        return ResponseEntity.ok().build();
    }
}
