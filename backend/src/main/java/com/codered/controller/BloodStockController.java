package com.codered.controller;

import com.codered.model.BloodStock;
import com.codered.model.Hospital;
import com.codered.model.User;
import com.codered.model.enums.UserRole;
import com.codered.repository.BloodStockRepository;
import com.codered.repository.HospitalRepository;
import com.codered.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getAllStock(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        if (user.getRole() == UserRole.HSA) {
            // HSA sees all hospitals grouped
            List<Hospital> hospitals = hospitalRepository.findAll();
            Map<String, Object> result = hospitals.stream().collect(Collectors.toMap(
                    Hospital::getCode,
                    h -> bloodStockRepository.findByHospital(h)
            ));
            return ResponseEntity.ok(result);
        } else {
            // Hospital staff sees only their hospital
            List<BloodStock> stock = bloodStockRepository.findByHospital(user.getHospital());
            return ResponseEntity.ok(stock);
        }
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

    @GetMapping("/summary")
    public ResponseEntity<?> getSummary(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        List<BloodStock> stocks;

        if (user.getRole() == UserRole.HSA) {
            stocks = bloodStockRepository.findAll();
        } else {
            stocks = bloodStockRepository.findByHospital(user.getHospital());
        }

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
