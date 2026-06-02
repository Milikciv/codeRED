package com.codered.controller;

import com.codered.model.Donor;
import com.codered.model.RecommendedDrive;
import com.codered.model.enums.DonorStatus;
import com.codered.repository.DonorRepository;
import com.codered.repository.RecommendedDriveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommended-drive")
@RequiredArgsConstructor
public class RecommendedDriveController {

    private final RecommendedDriveRepository recommendedDriveRepository;
    private final DonorRepository donorRepository;

    private static final Map<String, String[]> REGION_META = Map.of(
        "Tampines",    new String[]{"Tampines Community Plaza", "72"},
        "Jurong East", new String[]{"JEM (Level 1)",            "65"},
        "Woodlands",   new String[]{"Woodlands Civic Centre",  "63"},
        "Ang Mo Kio",  new String[]{"AMK Hub",                 "59"},
        "Bedok",       new String[]{"Bedok Community Centre",  "55"},
        "Bukit Batok", new String[]{"Beauty World Plaza",      "52"},
        "Clementi",    new String[]{"Clementi Mall",           "50"},
        "Yishun",      new String[]{"Northpoint City",         "49"}
    );

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

        // Alternative locations: compute from real donor data, skip the primary location
        List<Map<String, Object>> altLocations = computeHotspots().stream()
            .filter(m -> !drive.getLocation().contains((String) m.get("name")))
            .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("alertId",            drive.getAlertCode());
        result.put("location",           drive.getLocation());
        result.put("bloodType",          drive.getBloodType());
        result.put("date",               drive.getDate());
        result.put("time",               drive.getStartTime() + " – " + drive.getEndTime());
        result.put("eligibleDonors",     drive.getEligibleDonors());
        result.put("highResponseDonors", drive.getHighResponseDonors());
        result.put("pastSuccessRate",    drive.getPastSuccessRate());
        result.put("confidenceScore",    drive.getConfidenceScore());
        result.put("impact",             drive.getImpact());
        result.put("reasons",            reasons);
        result.put("scoreBreakdown",     scoreBreakdown);
        result.put("alternativeLocations", altLocations);
        return ResponseEntity.ok(result);
    }

    private List<Map<String, Object>> computeHotspots() {
        List<Donor> active = donorRepository.findByStatus(DonorStatus.ACTIVE);
        LocalDate today = LocalDate.now();

        Map<String, List<Donor>> byRegion = active.stream()
            .collect(Collectors.groupingBy(Donor::getRegion));

        long maxActive = byRegion.values().stream().mapToLong(List::size).max().orElse(1);

        return byRegion.entrySet().stream()
            .filter(e -> REGION_META.containsKey(e.getKey()))
            .map(e -> {
                String region = e.getKey();
                List<Donor> donors = e.getValue();
                long activeDonorCount = donors.size();
                long eligibleDonors = donors.stream()
                    .filter(d -> d.getLastDonationDate() == null
                              || d.getLastDonationDate().isBefore(today.minusMonths(3)))
                    .count();
                int score = (int) Math.round(
                    (activeDonorCount * 60.0 / maxActive) +
                    (eligibleDonors * 40.0 / Math.max(activeDonorCount, 1))
                );
                String[] meta = REGION_META.get(region);
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("name",           region);
                m.put("venue",          meta[0]);
                m.put("score",          score);
                m.put("eligibleDonors", eligibleDonors);
                m.put("successRate",    Integer.parseInt(meta[1]));
                return m;
            })
            .sorted(Comparator.comparingInt((Map<String, Object> m) -> (int) m.get("score")).reversed())
            .collect(Collectors.toList());
    }
}
