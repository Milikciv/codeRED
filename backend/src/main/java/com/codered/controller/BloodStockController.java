package com.codered.controller;

import com.codered.model.BloodStock;
import com.codered.model.Hospital;
import com.codered.repository.BloodStockRepository;
import com.codered.repository.HospitalRepository;
import com.codered.service.BloodStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/blood-stock")
@RequiredArgsConstructor
public class BloodStockController {

    private final BloodStockRepository bloodStockRepository;
    private final HospitalRepository hospitalRepository;
    private final BloodStockService bloodStockService;

    @GetMapping
    public ResponseEntity<?> getAllStock() {
        List<Hospital> hospitals = hospitalRepository.findAll();
        Map<String, Object> result = hospitals.stream().collect(Collectors.toMap(
                Hospital::getCode,
                h -> bloodStockRepository.findByHospital(h)
        ));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/hospitals")
    public ResponseEntity<List<Hospital>> getAllHospitals() {
        return ResponseEntity.ok(hospitalRepository.findAll());
    }

    @GetMapping("/hospital/{code}")
    public ResponseEntity<List<BloodStock>> getStockByHospital(@PathVariable String code) {
        Hospital hospital = hospitalRepository.findByCode(code).orElseThrow();
        return ResponseEntity.ok(bloodStockRepository.findByHospital(hospital));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BloodStock> updateStock(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        return ResponseEntity.ok(bloodStockService.updateStock(id, body.get("currentUnits")));
    }

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary() {
        List<BloodStock> stocks = bloodStockRepository.findAll();
        double totalCurrent = stocks.stream().mapToInt(BloodStock::getCurrentUnits).sum();
        double totalIdeal = stocks.stream().mapToInt(BloodStock::getIdealUnits).sum();
        double percentage = totalIdeal > 0 ? (totalCurrent / totalIdeal) * 100 : 0;

        long criticalTypes = stocks.stream()
                .filter(s -> s.getSupplyPercentage() < 40)
                .count();

        return ResponseEntity.ok(Map.of(
                "percentage", Math.round(percentage),
                "criticalTypeCount", criticalTypes,
                "totalUnits", (int) totalCurrent
        ));
    }
}
