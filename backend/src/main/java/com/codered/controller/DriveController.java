package com.codered.controller;

import com.codered.model.RecommendedDrive;
import com.codered.repository.RecommendedDriveRepository;
import com.codered.service.DonationDriveService;
import com.codered.service.RecommendationReasoningService;
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
    private final RecommendationReasoningService recommendationReasoningService;

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
            @RequestParam(required = false) String alertCode,
            @RequestParam(defaultValue = "1") int rank) {
        RecommendedDrive drive = alertCode != null
            ? recommendedDriveRepository.findByAlertCodeAndRank(alertCode, rank).orElse(null)
            : recommendedDriveRepository.findAll().stream().filter(d -> d.getRank() == 1).findFirst().orElse(null);

        if (drive == null) return ResponseEntity.notFound().build();

        String narrative = drive.getReasons().stream()
            .filter(r -> "Narrative".equals(r.getLabel()))
            .map(r -> r.getDetail())
            .findFirst().orElse(null);

        List<Map<String, Object>> reasons = drive.getReasons().stream()
            .filter(r -> !"Narrative".equals(r.getLabel()))
            .map(r -> Map.<String, Object>of("label", r.getLabel(), "detail", r.getDetail()))
            .collect(Collectors.toList());

        List<Map<String, Object>> scoreBreakdown = drive.getScoreBreakdown().stream()
            .map(s -> Map.<String, Object>of(
                "criterion", s.getCriterion(),
                "weight",    s.getWeight(),
                "score",     s.getScore()
            ))
            .collect(Collectors.toList());

        List<Map<String, Object>> altLocations = recommendedDriveRepository
            .findByAlertCodeAndRankGreaterThanOrderByRankAsc(drive.getAlertCode(), 1)
            .stream()
            .map(d -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("rank",            d.getRank());
                m.put("location",        d.getLocation());
                m.put("bloodType",       d.getBloodType());
                m.put("eligibleDonors",  d.getEligibleDonors());
                m.put("pastSuccessRate", d.getPastSuccessRate());
                m.put("confidenceScore", d.getConfidenceScore());
                return m;
            })
            .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("alertId",              drive.getAlertCode());
        result.put("rank",                 drive.getRank());
        result.put("location",             drive.getLocation());
        result.put("bloodType",            drive.getBloodType());
        result.put("date",                 drive.getDate());
        result.put("time",                 drive.getStartTime() + " – " + drive.getEndTime());
        result.put("eligibleDonors",       drive.getEligibleDonors());
        result.put("highResponseDonors",   drive.getHighResponseDonors());
        result.put("pastSuccessRate",      drive.getPastSuccessRate());
        result.put("confidenceScore",      drive.getConfidenceScore());
        result.put("impact",               narrative);
        result.put("reasons",              reasons);
        result.put("scoreBreakdown",       scoreBreakdown);
        result.put("alternativeLocations", altLocations);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/recommended/locations")
    public ResponseEntity<List<Map<String, Object>>> getDriveLocations(
            @RequestParam String alertCode) {
        List<Map<String, Object>> locations = recommendedDriveRepository
            .findByAlertCodeOrderByRankAsc(alertCode)
            .stream()
            .map(d -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("rank",            d.getRank());
                m.put("location",        d.getLocation());
                m.put("bloodType",       d.getBloodType());
                m.put("eligibleDonors",  d.getEligibleDonors());
                m.put("pastSuccessRate", d.getPastSuccessRate());
                m.put("confidenceScore", d.getConfidenceScore());
                m.put("lat",             d.getLatitude());
                m.put("lng",             d.getLongitude());
                return m;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(locations);
    }

    @PostMapping("/recommended/{alertCode}/regenerate-reasoning")
    public ResponseEntity<Map<String, Object>> regenerateRecommendedDriveReasoning(
            @PathVariable String alertCode,
            @RequestBody(required = false) Map<String, String> body) {
        RecommendedDrive drive = recommendedDriveRepository.findByAlertCodeAndRank(alertCode, 1)
            .orElseThrow(() -> new IllegalArgumentException("Recommended drive not found: " + alertCode));

        String hotspotContext = body != null && body.containsKey("hotspotContext")
            ? body.get("hotspotContext")
            : "High-density area with good accessibility and community engagement.";

        recommendationReasoningService.generateAndSaveReasoningForDrive(drive, hotspotContext);

        return getRecommendedDrive(alertCode, 1);
    }
}
