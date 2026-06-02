package com.codered.controller;

import com.codered.model.DonorDemographic;
import com.codered.repository.DonorDemographicRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/donors")
@RequiredArgsConstructor
public class DonorStatsController {

    private final DonorDemographicRepository repo;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDonorStats() {
        // summary: activeDonors, eligibleRepeat, dormant, responseRate
        Map<String, Object> summary = new LinkedHashMap<>();
        for (DonorDemographic r : repo.findByCategoryOrderBySortOrderAsc("summary")) {
            summary.put(r.getLabel(), "responseRate".equals(r.getLabel()) ? r.getPercentage() : r.getCount());
        }

        // byBloodType
        List<Map<String, Object>> byBloodType = repo.findByCategoryOrderBySortOrderAsc("blood_type").stream()
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("type", r.getLabel());
                m.put("count", r.getCount());
                m.put("pct", r.getPercentage());
                return m;
            }).collect(Collectors.toList());

        // byAge
        List<Map<String, Object>> byAge = repo.findByCategoryOrderBySortOrderAsc("age").stream()
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("group", r.getLabel());
                m.put("count", r.getCount());
                m.put("pct", r.getPercentage());
                return m;
            }).collect(Collectors.toList());

        // byLocation
        List<Map<String, Object>> byLocation = repo.findByCategoryOrderBySortOrderAsc("location").stream()
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("rank", r.getRank());
                m.put("name", r.getLabel());
                m.put("count", r.getCount());
                m.put("pos", List.of(r.getLatitude(), r.getLongitude()));
                return m;
            }).collect(Collectors.toList());

        // responseRateTrend
        List<Map<String, Object>> responseRateTrend = repo.findByCategoryOrderBySortOrderAsc("response_rate").stream()
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("month", r.getLabel());
                m.put("rate", r.getRate());
                return m;
            }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
            "summary", summary,
            "byBloodType", byBloodType,
            "byAge", byAge,
            "byLocation", byLocation,
            "responseRateTrend", responseRateTrend
        ));
    }
}
