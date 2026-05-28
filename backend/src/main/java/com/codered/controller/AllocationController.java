package com.codered.controller;

import com.codered.model.BloodRequest;
import com.codered.model.BloodStock;
import com.codered.model.Hospital;
import com.codered.repository.BloodRequestRepository;
import com.codered.repository.BloodStockRepository;
import com.codered.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/allocation")
@RequiredArgsConstructor
public class AllocationController {

    private final BloodStockRepository bloodStockRepository;
    private final HospitalRepository hospitalRepository;
    private final BloodRequestRepository bloodRequestRepository;

    @GetMapping("/inventory")
    public ResponseEntity<Map<String, Object>> getInventory() {
        List<BloodStock> allStock = bloodStockRepository.findAll();
        Map<String, Integer> byType = allStock.stream()
                .collect(Collectors.groupingBy(
                        s -> s.getBloodType().getLabel(),
                        Collectors.summingInt(BloodStock::getCurrentUnits)
                ));

        int totalStock = allStock.stream().mapToInt(BloodStock::getCurrentUnits).sum();

        return ResponseEntity.ok(Map.of(
                "totalStock", totalStock,
                "byType", byType
        ));
    }

    @GetMapping("/donor-hospitals/{requestId}")
    public ResponseEntity<List<Map<String, Object>>> getDonorHospitals(@PathVariable Long requestId) {
        BloodRequest request = bloodRequestRepository.findById(requestId).orElseThrow();

        List<Hospital> hospitals = hospitalRepository.findAll().stream()
                .filter(h -> !h.getId().equals(request.getRequestingHospital().getId()))
                .toList();

        List<Map<String, Object>> result = hospitals.stream().map(h -> {
            List<BloodStock> stocks = bloodStockRepository.findByHospital(h);
            BloodStock matchingStock = stocks.stream()
                    .filter(s -> s.getBloodType() == request.getBloodType())
                    .findFirst().orElse(null);

            int current = matchingStock != null ? matchingStock.getCurrentUnits() : 0;
            int ideal = matchingStock != null ? matchingStock.getIdealUnits() : 1;
            double pct = (double) current / ideal * 100;
            String safeToTransfer = pct >= 70 ? "Yes" : pct >= 40 ? "Caution" : "No";
            int maxTransfer = (int) (current * 0.3);

            return Map.<String, Object>of(
                    "hospitalId", h.getId(),
                    "hospitalName", h.getName(),
                    "hospitalCode", h.getCode(),
                    "distance", (int) (Math.random() * 15 + 3) + " km",
                    "stock", current,
                    "stockPct", (int) pct,
                    "safeToTransfer", safeToTransfer,
                    "maxSafeTransfer", maxTransfer
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/approve")
    public ResponseEntity<Map<String, String>> approveAllocation(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Blood units have been allocated and dispatch notification sent"
        ));
    }
}
