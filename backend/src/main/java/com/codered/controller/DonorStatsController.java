package com.codered.controller;

import com.codered.model.Donor;
import com.codered.model.enums.BloodType;
import com.codered.model.enums.DonorStatus;
import com.codered.repository.DonorDemographicRepository;
import com.codered.repository.DonorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/donors")
@RequiredArgsConstructor
public class DonorStatsController {

    private final DonorRepository donorRepository;
    private final DonorDemographicRepository donorDemographicRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDonorStats() {
        List<Donor> all = donorRepository.findAll();
        LocalDate today = LocalDate.now();

        // ── summary ──────────────────────────────────────────────────────
        long active = all.stream().filter(d -> d.getStatus() == DonorStatus.ACTIVE).count();
        long dormant = all.stream().filter(d -> d.getStatus() == DonorStatus.DORMANT).count();
        long eligibleRepeat = all.stream()
            .filter(d -> d.getStatus() == DonorStatus.ACTIVE)
            .filter(d -> d.getLastDonationDate() == null
                      || d.getLastDonationDate().isBefore(today.minusMonths(3)))
            .count();

        // Response rate comes from historical outreach campaign data
        double responseRate = donorDemographicRepository
            .findByCategoryOrderBySortOrderAsc("response_rate")
            .stream()
            .mapToDouble(r -> r.getRate() != null ? r.getRate() : 0.0)
            .reduce((a, b) -> b)  // last (most recent) value
            .orElse(0.0);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("activeDonors",   active);
        summary.put("eligibleRepeat", eligibleRepeat);
        summary.put("dormant",        dormant);
        summary.put("responseRate",   responseRate);

        // ── by blood type ─────────────────────────────────────────────────
        Map<BloodType, Long> btCounts = all.stream()
            .collect(Collectors.groupingBy(Donor::getBloodType, Collectors.counting()));

        long totalDonors = all.size();
        List<Map<String, Object>> byBloodType = Arrays.stream(BloodType.values())
            .filter(bt -> btCounts.containsKey(bt))
            .sorted(Comparator.comparingLong((BloodType bt) -> btCounts.getOrDefault(bt, 0L)).reversed())
            .map(bt -> {
                long count = btCounts.getOrDefault(bt, 0L);
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("type",  bt.getLabel());
                m.put("count", count);
                m.put("pct",   totalDonors > 0 ? Math.round(count * 1000.0 / totalDonors) / 10.0 : 0.0);
                return m;
            })
            .collect(Collectors.toList());

        // ── by age group ──────────────────────────────────────────────────
        String[] ageGroups  = {"16-20", "21-30", "31-40", "41-50", "51-60", "60+"};
        int[]    ageMinYear = {2006,    1996,    1986,    1976,    1966,    0};
        int[]    ageMaxYear = {2010,    2005,    1995,    1985,    1975,    1965};

        List<Map<String, Object>> byAge = new ArrayList<>();
        for (int i = 0; i < ageGroups.length; i++) {
            final int minYear = ageMinYear[i];
            final int maxYear = ageMaxYear[i];
            long count = all.stream().filter(d -> {
                int age = Period.between(d.getDateOfBirth(), today).getYears();
                if (maxYear == 0) return age >= 60;            // 60+
                int birthYear = d.getDateOfBirth().getYear();
                return birthYear >= minYear && birthYear <= maxYear;
            }).count();

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("group", ageGroups[i]);
            m.put("count", count);
            m.put("pct",   totalDonors > 0 ? Math.round(count * 1000.0 / totalDonors) / 10.0 : 0.0);
            byAge.add(m);
        }

        // ── by location (active donors only, ranked by count) ─────────────
        Map<String, List<Donor>> byRegion = all.stream()
            .filter(d -> d.getStatus() == DonorStatus.ACTIVE)
            .collect(Collectors.groupingBy(Donor::getRegion));

        List<Map<String, Object>> byLocation = byRegion.entrySet().stream()
            .sorted(Comparator.comparingInt((Map.Entry<String, List<Donor>> e) -> e.getValue().size()).reversed())
            .collect(Collectors.toList())
            .stream()
            .map(new java.util.function.Function<Map.Entry<String, List<Donor>>, Map<String, Object>>() {
                int rank = 1;
                public Map<String, Object> apply(Map.Entry<String, List<Donor>> e) {
                    Donor sample = e.getValue().get(0);
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("rank",  rank++);
                    m.put("name",  e.getKey());
                    m.put("count", (long) e.getValue().size());
                    m.put("pos",   List.of(sample.getLatitude(), sample.getLongitude()));
                    return m;
                }
            })
            .collect(Collectors.toList());

        // ── response rate trend (historical outreach campaign data) ───────
        List<Map<String, Object>> responseRateTrend = donorDemographicRepository
            .findByCategoryOrderBySortOrderAsc("response_rate").stream()
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("month", r.getLabel());
                m.put("rate",  r.getRate());
                return m;
            })
            .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
            "summary",           summary,
            "byBloodType",       byBloodType,
            "byAge",             byAge,
            "byLocation",        byLocation,
            "responseRateTrend", responseRateTrend
        ));
    }
}
