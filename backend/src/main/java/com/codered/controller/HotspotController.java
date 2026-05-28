package com.codered.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hotspots")
public class HotspotController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHotspots() {
        List<Map<String, Object>> insights = List.of(
            Map.of("name", "Ang Mo Kio Hotspot", "color", "red", "potentialDonors", 627,
                   "ageGroup", "31-50 Years Old",
                   "recommendation", "Deploy community donation drive at Ang Mo Kio Community Club"),
            Map.of("name", "Youth Bedok Cluster", "color", "orange", "potentialDonors", 283,
                   "ageGroup", "16-30 Years Old",
                   "recommendation", "Partner with nearby institutions")
        );

        List<Map<String, Object>> communityDrives = List.of(
            Map.of("name", "Community Drive @ Boon Lay MRT...", "donors", 3948, "lastDrive", "11-12 November 2025"),
            Map.of("name", "Community Drive @ Yew Tee CC", "donors", 3456, "lastDrive", "19-20 November 2025"),
            Map.of("name", "Community Drive @ Ang Mo Kio CC", "donors", 2876, "lastDrive", "28-29 November 2025"),
            Map.of("name", "Community Drive @ Serangoon CC", "donors", 2545, "lastDrive", "1-2 December 2025"),
            Map.of("name", "Community Drive @ Tampines M...", "donors", 2344, "lastDrive", "5-6 December 2025"),
            Map.of("name", "Community Drive @ Raffles Place...", "donors", 2219, "lastDrive", "11-12 December 2026"),
            Map.of("name", "Community Drive @ Woodlands CC", "donors", 2157, "lastDrive", "11-12 January 2026"),
            Map.of("name", "Community Drive @ Marine Para...", "donors", 2134, "lastDrive", "15-16 January 2026")
        );

        List<Map<String, Object>> ageGroupData = List.of(
            Map.of("month", "Feb", "total", 800, "age16to30", 300, "age31to50", 350, "above50", 150),
            Map.of("month", "Mar", "total", 900, "age16to30", 320, "age31to50", 400, "above50", 180),
            Map.of("month", "Apr", "total", 950, "age16to30", 340, "age31to50", 420, "above50", 190),
            Map.of("month", "May 01", "total", 1000, "age16to30", 350, "age31to50", 450, "above50", 200),
            Map.of("month", "May 15", "total", 1050, "age16to30", 360, "age31to50", 470, "above50", 220),
            Map.of("month", "May 21", "total", 1100, "age16to30", 380, "age31to50", 490, "above50", 230)
        );

        return ResponseEntity.ok(Map.of(
            "mostActiveAgeGroup", "31-50 Years Old",
            "mostActiveAgeGroupPct", 52,
            "activeHotspots", 20,
            "highestDonorZone", "Central (Outram)",
            "highestDonorZoneCount", 1726,
            "insights", insights,
            "communityDrives", communityDrives,
            "ageGroupData", ageGroupData
        ));
    }
}
