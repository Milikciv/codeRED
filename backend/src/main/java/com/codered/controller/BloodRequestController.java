package com.codered.controller;

import com.codered.model.BloodRequest;
import com.codered.model.enums.RequestStatus;
import com.codered.repository.BloodRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class BloodRequestController {

    private final BloodRequestRepository bloodRequestRepository;

    @GetMapping
    public ResponseEntity<List<BloodRequest>> getRequests() {
        return ResponseEntity.ok(bloodRequestRepository.findAllByOrderByRequestedAtDesc());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BloodRequest> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        BloodRequest request = bloodRequestRepository.findById(id).orElseThrow();
        request.setStatus(RequestStatus.valueOf(body.get("status").toUpperCase()));
        return ResponseEntity.ok(bloodRequestRepository.save(request));
    }

    @GetMapping("/active-count")
    public ResponseEntity<Map<String, Long>> getActiveCount() {
        long count = bloodRequestRepository.countByStatus(RequestStatus.PENDING);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
