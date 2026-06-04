package com.codered.controller;

import com.codered.service.DonorHotspotService;
import com.codered.service.DonorStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donors")
@RequiredArgsConstructor
public class DonorController {

    private final DonorStatsService donorStatsService;
    private final DonorHotspotService donorHotspotService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDonorStats() {
        return ResponseEntity.ok(donorStatsService.getDonorStats());
    }

    @GetMapping("/hotspots")
    public ResponseEntity<List<Map<String, Object>>> getDonorHotspots() {
        return ResponseEntity.ok(donorHotspotService.getHotspots());
    }
}
