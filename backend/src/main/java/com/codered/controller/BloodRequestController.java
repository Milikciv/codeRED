package com.codered.controller;

import com.codered.model.BloodRequest;
import com.codered.service.BloodRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class BloodRequestController {

    private final BloodRequestService bloodRequestService;

    @GetMapping
    public ResponseEntity<List<BloodRequest>> getRequests() {
        return ResponseEntity.ok(bloodRequestService.getRequests());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BloodRequest> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(bloodRequestService.updateStatus(id, body.get("status")));
    }

    @GetMapping("/active-count")
    public ResponseEntity<Map<String, Long>> getActiveCount() {
        return ResponseEntity.ok(Map.of("count", bloodRequestService.getActiveCount()));
    }
}
