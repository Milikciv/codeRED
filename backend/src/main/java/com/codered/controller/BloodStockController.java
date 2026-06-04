package com.codered.controller;

import com.codered.model.BloodStock;
import com.codered.model.Hospital;
import com.codered.service.BloodStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/blood-stock")
@RequiredArgsConstructor
public class BloodStockController {

    private final BloodStockService bloodStockService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllStock() {
        return ResponseEntity.ok(bloodStockService.getAllStockGrouped());
    }

    @GetMapping("/hospitals")
    public ResponseEntity<List<Hospital>> getAllHospitals() {
        return ResponseEntity.ok(bloodStockService.getAllHospitals());
    }

    @GetMapping("/hospital/{code}")
    public ResponseEntity<List<BloodStock>> getStockByHospital(@PathVariable String code) {
        return ResponseEntity.ok(bloodStockService.getStockByHospital(code));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BloodStock> updateStock(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(bloodStockService.updateStock(id, body.get("currentUnits")));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(bloodStockService.getSummary());
    }
}
