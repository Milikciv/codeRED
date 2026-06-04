package com.codered.service;

import com.codered.model.Donor;
import com.codered.model.enums.BloodType;
import com.codered.model.enums.DonorStatus;
import com.codered.repository.DonorDemographicRepository;
import com.codered.repository.DonorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonorStatsService {

    private final DonorRepository donorRepository;
    private final DonorDemographicRepository donorDemographicRepository;

    public Map<String, Object> getDonorStats() {
        List<Donor> all = donorRepository.findAll();
        LocalDate today = LocalDate.now();

        return Map.of(
            "summary",           buildSummary(all, today),
            "byBloodType",       buildByBloodType(all),
            "byAge",             buildByAge(all, today),
            "byLocation",        buildByLocation(all),
            "responseRateTrend", buildResponseRateTrend()
        );
    }

    private Map<String, Object> buildSummary(List<Donor> all, LocalDate today) {
        long active = all.stream().filter(d -> d.getStatus() == DonorStatus.ACTIVE).count();
        long dormant = all.stream().filter(d -> d.getStatus() == DonorStatus.DORMANT).count();
        long eligibleRepeat = all.stream()
            .filter(d -> d.getStatus() == DonorStatus.ACTIVE)
            .filter(d -> d.getLastDonationDate() == null
                      || d.getLastDonationDate().isBefore(today.minusMonths(3)))
            .count();

        double responseRate = donorDemographicRepository
            .findByCategoryOrderBySortOrderAsc("response_rate")
            .stream()
            .mapToDouble(r -> r.getRate() != null ? r.getRate() : 0.0)
            .reduce((a, b) -> b)
            .orElse(0.0);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("activeDonors",   active);
        summary.put("eligibleRepeat", eligibleRepeat);
        summary.put("dormant",        dormant);
        summary.put("responseRate",   responseRate);
        return summary;
    }

    private List<Map<String, Object>> buildByBloodType(List<Donor> all) {
        Map<BloodType, Long> btCounts = all.stream()
            .collect(Collectors.groupingBy(Donor::getBloodType, Collectors.counting()));

        long total = all.size();
        return Arrays.stream(BloodType.values())
            .filter(btCounts::containsKey)
            .sorted(Comparator.comparingLong((BloodType bt) -> btCounts.getOrDefault(bt, 0L)).reversed())
            .map(bt -> {
                long count = btCounts.getOrDefault(bt, 0L);
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("type",  bt.getLabel());
                m.put("count", count);
                m.put("pct",   total > 0 ? Math.round(count * 1000.0 / total) / 10.0 : 0.0);
                return (Map<String, Object>) m;
            })
            .collect(Collectors.toList());
    }

    private List<Map<String, Object>> buildByAge(List<Donor> all, LocalDate today) {
        String[] ageGroups  = {"16-20", "21-30", "31-40", "41-50", "51-60", "60+"};
        int[]    ageMinYear = {2006,    1996,    1986,    1976,    1966,    0};
        int[]    ageMaxYear = {2010,    2005,    1995,    1985,    1975,    1965};

        long total = all.size();
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < ageGroups.length; i++) {
            final int minYear = ageMinYear[i];
            final int maxYear = ageMaxYear[i];
            long count = all.stream().filter(d -> {
                int age = Period.between(d.getDateOfBirth(), today).getYears();
                if (maxYear == 0) return age >= 60;
                int birthYear = d.getDateOfBirth().getYear();
                return birthYear >= minYear && birthYear <= maxYear;
            }).count();

            Map<String, Object> m = new LinkedHashMap<>();
            m.put("group", ageGroups[i]);
            m.put("count", count);
            m.put("pct",   total > 0 ? Math.round(count * 1000.0 / total) / 10.0 : 0.0);
            result.add(m);
        }
        return result;
    }

    private List<Map<String, Object>> buildByLocation(List<Donor> all) {
        Map<String, List<Donor>> byRegion = all.stream()
            .filter(d -> d.getStatus() == DonorStatus.ACTIVE)
            .collect(Collectors.groupingBy(Donor::getRegion));

        return byRegion.entrySet().stream()
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
    }

    private List<Map<String, Object>> buildResponseRateTrend() {
        return donorDemographicRepository
            .findByCategoryOrderBySortOrderAsc("response_rate").stream()
            .map(r -> {
                Map<String, Object> m = new LinkedHashMap<>();
                m.put("month", r.getLabel());
                m.put("rate",  r.getRate());
                return m;
            })
            .collect(Collectors.toList());
    }
}
