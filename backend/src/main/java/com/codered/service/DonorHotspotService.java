package com.codered.service;

import com.codered.model.Donor;
import com.codered.model.enums.DonorStatus;
import com.codered.repository.DonorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonorHotspotService {

    private final DonorRepository donorRepository;

    // Known venue per region and historical drive success rate (%) — stable physical facts
    static final Map<String, String[]> REGION_META = Map.of(
        "Tampines",    new String[]{"Tampines Community Plaza", "72"},
        "Jurong East", new String[]{"JEM (Level 1)",            "65"},
        "Woodlands",   new String[]{"Woodlands Civic Centre",  "63"},
        "Ang Mo Kio",  new String[]{"AMK Hub",                 "59"},
        "Bedok",       new String[]{"Bedok Community Centre",  "55"},
        "Bukit Batok", new String[]{"Beauty World Plaza",      "52"},
        "Clementi",    new String[]{"Clementi Mall",           "50"},
        "Yishun",      new String[]{"Northpoint City",         "49"}
    );

    public List<Map<String, Object>> getHotspots() {
        List<Donor> active = donorRepository.findByStatus(DonorStatus.ACTIVE);
        LocalDate today = LocalDate.now();

        Map<String, List<Donor>> byRegion = active.stream()
            .collect(Collectors.groupingBy(Donor::getRegion));

        long maxActive = byRegion.values().stream().mapToLong(List::size).max().orElse(1);

        List<Map<String, Object>> result = byRegion.entrySet().stream()
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
                Donor sample = donors.get(0);

                Map<String, Object> m = new LinkedHashMap<>();
                m.put("name",             region);
                m.put("score",            score);
                m.put("pos",              List.of(sample.getLatitude(), sample.getLongitude()));
                m.put("activeDonorCount", activeDonorCount);
                m.put("venue",            meta[0]);
                m.put("eligibleDonors",   eligibleDonors);
                m.put("successRate",      Integer.parseInt(meta[1]));
                return m;
            })
            .sorted(Comparator.comparingInt((Map<String, Object> m) -> (int) m.get("score")).reversed())
            .collect(Collectors.toList());

        for (int i = 0; i < result.size(); i++) {
            result.get(i).put("rank", i + 1);
        }

        return result;
    }
}
