package com.codered.controller;

import com.codered.model.RecommendedDrive;
import com.codered.repository.DonorHotspotRepository;
import com.codered.repository.RecommendedDriveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommended-drive")
@RequiredArgsConstructor
public class RecommendedDriveController {

    private final RecommendedDriveRepository recommendedDriveRepository;
    private final DonorHotspotRepository donorHotspotRepository;

    @GetMapping
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
                "weight", s.getWeight(),
                "score", s.getScore()
            ))
            .collect(Collectors.toList());

        // Alternative locations: all hotspots with rank > 1
        List<Map<String, Object>> altLocations = donorHotspotRepository.findAllByOrderByRankAsc().stream()
            .filter(h -> h.getRank() > 1)
            .map(h -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("name", h.getName());
                m.put("venue", h.getVenue() != null ? h.getVenue() : h.getName());
                m.put("score", h.getScore());
                m.put("eligibleDonors", h.getEligibleDonors() != null ? h.getEligibleDonors() : 0);
                m.put("successRate", h.getSuccessRate() != null ? h.getSuccessRate() : 0);
                return m;
            })
            .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("alertId", drive.getAlertCode());
        result.put("location", drive.getLocation());
        result.put("bloodType", drive.getBloodType());
        result.put("date", drive.getDate());
        result.put("time", drive.getStartTime() + " – " + drive.getEndTime());
        result.put("eligibleDonors", drive.getEligibleDonors());
        result.put("highResponseDonors", drive.getHighResponseDonors());
        result.put("pastSuccessRate", drive.getPastSuccessRate());
        result.put("confidenceScore", drive.getConfidenceScore());
        result.put("impact", drive.getImpact());
        result.put("reasons", reasons);
        result.put("scoreBreakdown", scoreBreakdown);
        result.put("alternativeLocations", altLocations);
        return ResponseEntity.ok(result);
    }
}
