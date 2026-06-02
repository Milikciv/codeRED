package com.codered.controller;

import com.codered.repository.DonorHotspotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/donor-hotspots")
@RequiredArgsConstructor
public class DonorHotspotController {

    private final DonorHotspotRepository hotspotRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getDonorHotspots() {
        List<Map<String, Object>> result = hotspotRepository.findAllByOrderByRankAsc().stream()
            .map(h -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("rank", h.getRank());
                m.put("name", h.getName());
                m.put("score", h.getScore());
                m.put("pos", List.of(h.getLatitude(), h.getLongitude()));
                m.put("activeDonorCount", h.getActiveDonorCount());
                m.put("venue", h.getVenue());
                m.put("eligibleDonors", h.getEligibleDonors());
                m.put("successRate", h.getSuccessRate());
                return m;
            })
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
