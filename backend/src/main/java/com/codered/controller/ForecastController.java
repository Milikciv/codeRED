package com.codered.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forecast")
public class ForecastController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> getForecast() {
        // Mock forecast data matching the Figma design
        List<Map<String, Object>> chartData = List.of(
            Map.of("date", "May 14", "actual", 900, "forecast", 920, "upper", 1100, "lower", 740),
            Map.of("date", "May 15", "actual", 950, "forecast", 970, "upper", 1150, "lower", 790),
            Map.of("date", "May 16", "actual", 880, "forecast", 900, "upper", 1080, "lower", 720),
            Map.of("date", "May 17", "actual", 1000, "forecast", 1020, "upper", 1200, "lower", 840),
            Map.of("date", "May 18", "actual", 1050, "forecast", 1080, "upper", 1280, "lower", 880),
            Map.of("date", "May 19", "actual", 1100, "forecast", 1150, "upper", 1350, "lower", 950),
            Map.of("date", "May 20", "actual", 1080, "forecast", 1120, "upper", 1320, "lower", 920),
            Map.of("date", "May 21", "forecast", 1200, "upper", 1400, "lower", 1000),
            Map.of("date", "May 22", "forecast", 1350, "upper", 1580, "lower", 1120),
            Map.of("date", "May 23", "forecast", 1400, "upper", 1650, "lower", 1150),
            Map.of("date", "May 24", "forecast", 1580, "upper", 1800, "lower", 1360),
            Map.of("date", "May 25", "forecast", 1500, "upper", 1720, "lower", 1280),
            Map.of("date", "May 26", "forecast", 1300, "upper", 1520, "lower", 1080),
            Map.of("date", "May 27", "forecast", 1100, "upper", 1300, "lower", 900)
        );

        List<Map<String, Object>> byBloodType = List.of(
            Map.of("bloodType", "O+", "currentSupply", 620, "supplyPct", 87, "status", "Good"),
            Map.of("bloodType", "A+", "currentSupply", 410, "supplyPct", 70, "status", "Good"),
            Map.of("bloodType", "B+", "currentSupply", 210, "supplyPct", 62, "status", "Medium"),
            Map.of("bloodType", "AB+", "currentSupply", 210, "supplyPct", 62, "status", "Medium"),
            Map.of("bloodType", "O-", "currentSupply", 90, "supplyPct", 20, "status", "High Risk"),
            Map.of("bloodType", "A-", "currentSupply", 90, "supplyPct", 20, "status", "High Risk"),
            Map.of("bloodType", "B-", "currentSupply", 90, "supplyPct", 20, "status", "High Risk"),
            Map.of("bloodType", "AB-", "currentSupply", 90, "supplyPct", 50, "status", "Medium")
        );

        List<Map<String, Object>> demandDrivers = List.of(
            Map.of("name", "Seasonality", "description", "Higher demand this month", "change", 26),
            Map.of("name", "Illness Trend", "description", "More Flu Cases this month", "change", 20),
            Map.of("name", "Public Holidays", "description", "3 Upcoming holidays", "change", 20),
            Map.of("name", "Events", "description", "2 Major Events this week", "change", 20)
        );

        return ResponseEntity.ok(Map.of(
            "predictedPeakDemand", 1580,
            "peakDate", "May 24, 2026",
            "highRiskPeriod", "May 22 - May 25",
            "highRiskDays", 3,
            "expectedShortfall", 230,
            "forecastAccuracy", 87,
            "chartData", chartData,
            "byBloodType", byBloodType,
            "demandDrivers", demandDrivers,
            "earlyWarning", Map.of(
                "message", "Possible Shortage of O- Blood in 3 days",
                "confidence", 87,
                "recommendation", "Allocate 20-30 units to high need hospitals and send push notifications to existing donors"
            )
        ));
    }
}
