package com.codered.controller;

import com.codered.model.RecommendedDrive;
import com.codered.repository.RecommendedDriveRepository;
import com.codered.service.DonationDriveService;
import com.codered.service.DonorHotspotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/drives")
@RequiredArgsConstructor
public class DriveController {

    private final DonationDriveService donationDriveService;
    private final RecommendedDriveRepository recommendedDriveRepository;
    private final DonorHotspotService donorHotspotService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getDrives() {
        return ResponseEntity.ok(donationDriveService.getDrives());
    }

    @PutMapping("/{driveCode}")
    public ResponseEntity<Map<String, Object>> updateDrive(
            @PathVariable String driveCode,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(donationDriveService.updateDrive(driveCode, body));
    }

    @GetMapping("/recommended")
    public ResponseEntity<Map<String, Object>> getRecommendedDrive(
            @RequestParam(required = false) String alertCode) {
        RecommendedDrive drive = alertCode != null
            ? recommendedDriveRepository.findByAlertCode(alertCode)
                .orElseGet(() -> recommendedDriveRepository.findAll().stream().findFirst().orElse(null))
            : recommendedDriveRepository.findAll().stream().findFirst().orElse(null);

        if (drive == null) return ResponseEntity.notFound().build();

        List<Map<String, Object>> reasons = drive.getReasons().stream()
            .map(r -> Map.<String, Object>of("label", r.getLabel(), "detail", r.getDetail()))
            .collect(Collectors.toList());

        List<Map<String, Object>> scoreBreakdown = drive.getScoreBreakdown().stream()
            .map(s -> Map.<String, Object>of(
                "criterion", s.getCriterion(),
                "weight",    s.getWeight(),
                "score",     s.getScore()
            ))
            .collect(Collectors.toList());

        List<Map<String, Object>> altLocations = donorHotspotService.getHotspots().stream()
            .filter(m -> !drive.getLocation().contains((String) m.get("name")))
            .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("alertId",              drive.getAlertCode());
        result.put("location",             drive.getLocation());
        result.put("bloodType",            drive.getBloodType());
        result.put("date",                 drive.getDate());
        result.put("time",                 drive.getStartTime() + " – " + drive.getEndTime());
        result.put("eligibleDonors",       drive.getEligibleDonors());
        result.put("highResponseDonors",   drive.getHighResponseDonors());
        result.put("pastSuccessRate",      drive.getPastSuccessRate());
        result.put("confidenceScore",      drive.getConfidenceScore());
        result.put("impact",               drive.getImpact());
        result.put("reasons",              reasons);
        result.put("scoreBreakdown",       scoreBreakdown);
        result.put("alternativeLocations", altLocations);
        return ResponseEntity.ok(result);
    }
}
