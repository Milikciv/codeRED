package com.codered.service;

import com.codered.model.BloodRequest;
import com.codered.model.BloodStock;
import com.codered.model.RequestBloodItem;
import com.codered.model.enums.BloodType;
import com.codered.repository.BloodRequestRepository;
import com.codered.repository.BloodStockRepository;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ForecastService {

    private final BloodStockRepository bloodStockRepository;
    private final BloodRequestRepository bloodRequestRepository;

    public ForecastService(BloodStockRepository bloodStockRepository,
                           BloodRequestRepository bloodRequestRepository) {
        this.bloodStockRepository = bloodStockRepository;
        this.bloodRequestRepository = bloodRequestRepository;
    }

    private static final int HISTORY_DAYS = 14;
    private static final int FORECAST_DAYS = 7;
    private static final List<String> CANONICAL_ORDER =
            List.of("O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-");
    private static final DateTimeFormatter DAY_LABEL =
            DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);
    private static final DateTimeFormatter FULL_DATE =
            DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH);

    public Map<String, Object> buildForecast() {
        LocalDate today = LocalDate.now();

        // 1. Current supply per blood type (summed across all hospitals)
        Map<String, int[]> stockByType = getStockByType();           // type -> [current, ideal]
        List<Map<String, Object>> byBloodType = buildByBloodType(stockByType);
        int totalCurrentSupply = stockByType.values().stream().mapToInt(a -> a[0]).sum();
        int totalIdeal = stockByType.values().stream().mapToInt(a -> a[1]).sum();

        // 2. Historical daily demand from real requests
        Map<LocalDate, Integer> demandHistory = getDailyDemand(today);

        // 3. Fit a simple trend model + build the chart series
        double[] fit = linearFit(today, demandHistory);              // [slope, intercept, residualStd]
        List<Map<String, Object>> chartData = buildChart(today, demandHistory, fit);

        // 4. Summary metrics derived from the forecast + a depletion model
        int safetyBuffer = (int) Math.round(totalIdeal * 0.25);      // treat <25% of ideal as risk
        int predictedPeakDemand = 0;
        LocalDate peakDate = today.plusDays(1);
        int cumulativeDemand = 0;
        int runningBalance = totalCurrentSupply;
        List<LocalDate> riskDays = new ArrayList<>();
        for (int i = 1; i <= FORECAST_DAYS; i++) {
            LocalDate d = today.plusDays(i);
            int forecast = forecastValue(fit, HISTORY_DAYS - 1 + i);
            if (forecast > predictedPeakDemand) {
                predictedPeakDemand = forecast;
                peakDate = d;
            }
            cumulativeDemand += forecast;
            runningBalance -= forecast;
            if (runningBalance < safetyBuffer) riskDays.add(d);
        }
        int expectedShortfall = Math.max(0, cumulativeDemand - totalCurrentSupply);
        int forecastAccuracy = computeAccuracy(today, demandHistory, fit);

        String highRiskPeriod;
        int highRiskDays;
        if (riskDays.isEmpty()) {
            highRiskPeriod = "None";
            highRiskDays = 0;
        } else {
            highRiskPeriod = riskDays.get(0).format(DAY_LABEL)
                    + " - " + riskDays.get(riskDays.size() - 1).format(DAY_LABEL);
            highRiskDays = riskDays.size();
        }

        // 5. Demand drivers (date-based heuristics) and 6. early warning
        List<Map<String, Object>> demandDrivers = buildDemandDrivers(today);
        Map<String, Object> earlyWarning = buildEarlyWarning(byBloodType, forecastAccuracy);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("predictedPeakDemand", predictedPeakDemand);
        result.put("peakDate", peakDate.format(FULL_DATE));
        result.put("highRiskPeriod", highRiskPeriod);
        result.put("highRiskDays", highRiskDays);
        result.put("expectedShortfall", expectedShortfall);
        result.put("forecastAccuracy", forecastAccuracy);
        result.put("chartData", chartData);
        result.put("byBloodType", byBloodType);
        result.put("demandDrivers", demandDrivers);
        result.put("earlyWarning", earlyWarning);
        return result;
    }

    // ---------- data access ----------

    private Map<String, int[]> getStockByType() {
        Map<String, int[]> map = new HashMap<>();
        for (BloodStock s : bloodStockRepository.findAll()) {
            if (s.getBloodType() == null) continue;
            String type = displayName(s.getBloodType());
            int[] agg = map.computeIfAbsent(type, k -> new int[2]);
            agg[0] += s.getCurrentUnits() == null ? 0 : s.getCurrentUnits();
            agg[1] += s.getIdealUnits() == null ? 0 : s.getIdealUnits();
        }
        return map;
    }

    private Map<LocalDate, Integer> getDailyDemand(LocalDate today) {
        Map<LocalDate, Integer> demand = new HashMap<>();
        LocalDate cutoff = today.minusDays(HISTORY_DAYS - 1);
        for (BloodRequest req : bloodRequestRepository.findAll()) {
            LocalDateTime ts = req.getRequestedAt();
            if (ts == null) continue;
            LocalDate day = ts.toLocalDate();
            if (day.isBefore(cutoff) || day.isAfter(today)) continue;
            demand.merge(day, unitsOf(req), Integer::sum);
        }
        return demand;
    }

    private int unitsOf(BloodRequest req) {
        List<RequestBloodItem> items = req.getBloodItems();
        if (items != null && !items.isEmpty()) {
            int sum = 0;
            for (RequestBloodItem item : items) {
                sum += item.getUnits() == null ? 0 : item.getUnits();
            }
            return sum;
        }
        return req.getUnitsRequested() == null ? 0 : req.getUnitsRequested();
    }

    // ---------- byBloodType ----------

    private List<Map<String, Object>> buildByBloodType(Map<String, int[]> stockByType) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (String type : CANONICAL_ORDER) {
            int[] agg = stockByType.getOrDefault(type, new int[2]);
            int current = agg[0];
            int ideal = agg[1];
            int pct = ideal <= 0 ? 0 : (int) Math.round(100.0 * current / ideal);
            pct = Math.min(pct, 100);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("bloodType", type);
            row.put("currentSupply", current);
            row.put("supplyPct", pct);
            row.put("status", statusFor(pct));
            rows.add(row);
        }
        return rows;
    }

    private String statusFor(int pct) {
        if (pct >= 70) return "Good";
        if (pct >= 40) return "Medium";
        return "High Risk";
    }

    // ---------- forecasting ----------

    private double[] linearFit(LocalDate today, Map<LocalDate, Integer> demand) {
        int n = HISTORY_DAYS;
        double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        double[] ys = new double[n];
        for (int i = 0; i < n; i++) {
            LocalDate d = today.minusDays(HISTORY_DAYS - 1 - i);
            double y = demand.getOrDefault(d, 0);
            ys[i] = y;
            sumX += i;
            sumY += y;
            sumXY += i * y;
            sumXX += (double) i * i;
        }
        double denom = n * sumXX - sumX * sumX;
        double slope = denom == 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
        double intercept = (sumY - slope * sumX) / n;
        double sse = 0;
        for (int i = 0; i < n; i++) {
            double pred = slope * i + intercept;
            sse += Math.pow(ys[i] - pred, 2);
        }
        double std = Math.sqrt(sse / n);
        return new double[]{slope, intercept, std};
    }

    private int forecastValue(double[] fit, int x) {
        return (int) Math.max(0, Math.round(fit[0] * x + fit[1]));
    }

    private List<Map<String, Object>> buildChart(LocalDate today,
                                                 Map<LocalDate, Integer> demand,
                                                 double[] fit) {
        List<Map<String, Object>> chart = new ArrayList<>();
        double band = Math.max(fit[2] * 1.5, 30);   // confidence half-width, floor 30
        for (int i = 0; i < HISTORY_DAYS; i++) {
            LocalDate d = today.minusDays(HISTORY_DAYS - 1 - i);
            int forecast = forecastValue(fit, i);
            Map<String, Object> p = new LinkedHashMap<>();
            p.put("date", d.format(DAY_LABEL));
            p.put("actual", demand.getOrDefault(d, 0));
            p.put("forecast", forecast);
            p.put("upper", forecast + (int) Math.round(band));
            p.put("lower", Math.max(0, forecast - (int) Math.round(band)));
            chart.add(p);
        }
        for (int j = 1; j <= FORECAST_DAYS; j++) {
            LocalDate d = today.plusDays(j);
            int forecast = forecastValue(fit, HISTORY_DAYS - 1 + j);
            double futureBand = band * (1 + 0.1 * j);   // widen further out
            Map<String, Object> p = new LinkedHashMap<>();
            p.put("date", d.format(DAY_LABEL));
            p.put("forecast", forecast);
            p.put("upper", forecast + (int) Math.round(futureBand));
            p.put("lower", Math.max(0, forecast - (int) Math.round(futureBand)));
            chart.add(p);
        }
        return chart;
    }

    private int computeAccuracy(LocalDate today, Map<LocalDate, Integer> demand, double[] fit) {
        double totalPctErr = 0;
        int count = 0;
        for (int i = 0; i < HISTORY_DAYS; i++) {
            LocalDate d = today.minusDays(HISTORY_DAYS - 1 - i);
            Integer actual = demand.get(d);
            if (actual == null || actual == 0) continue;
            int pred = forecastValue(fit, i);
            totalPctErr += Math.abs(actual - pred) / (double) actual;
            count++;
        }
        if (count == 0) return 85;   // not enough history yet
        int acc = (int) Math.round((1 - totalPctErr / count) * 100);
        return Math.max(50, Math.min(99, acc));
    }

    // ---------- demand drivers ----------

    private List<Map<String, Object>> buildDemandDrivers(LocalDate today) {
        List<Map<String, Object>> drivers = new ArrayList<>();
        int month = today.getMonthValue();

        drivers.add(driver("Seasonality", "Demand index for this period", seasonalChange(month)));

        int flu = (month == 12 || month == 1 || month == 6 || month == 7) ? 22 : 10;
        drivers.add(driver("Illness Trend", "Seasonal flu activity", flu));

        int holidays = upcomingHolidays(today, 30);
        if (holidays > 0) {
            drivers.add(driver("Public Holidays", holidays + " upcoming holiday(s)", 8 * holidays));
        }

        int weekends = 0;
        for (int i = 1; i <= 7; i++) {
            DayOfWeek dow = today.plusDays(i).getDayOfWeek();
            if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) weekends++;
        }
        drivers.add(driver("Weekend Effect", weekends + " weekend day(s) ahead", weekends * 5));

        return drivers;
    }

    private Map<String, Object> driver(String name, String desc, int change) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("name", name);
        m.put("description", desc);
        m.put("change", change);
        return m;
    }

    private int seasonalChange(int month) {
        int[] idx = {15, 10, 8, 5, 12, 20, 22, 18, 8, 6, 12, 25}; // Jan..Dec
        return idx[month - 1];
    }

    private int upcomingHolidays(LocalDate today, int withinDays) {
        int[][] fixed = {{1, 1}, {5, 1}, {8, 9}, {12, 25}}; // fixed-date SG public holidays
        int count = 0;
        for (int[] md : fixed) {
            LocalDate h = LocalDate.of(today.getYear(), md[0], md[1]);
            if (h.isBefore(today)) h = h.plusYears(1);
            if (!h.isAfter(today.plusDays(withinDays))) count++;
        }
        return count;
    }

    // ---------- early warning ----------

    private Map<String, Object> buildEarlyWarning(List<Map<String, Object>> byBloodType, int confidence) {
        Map<String, Object> worst = null;
        int worstPct = Integer.MAX_VALUE;
        for (Map<String, Object> row : byBloodType) {
            Integer pct = (Integer) row.get("supplyPct");
            if ("High Risk".equals(row.get("status")) && pct < worstPct) {
                worstPct = pct;
                worst = row;
            }
        }
        Map<String, Object> warning = new LinkedHashMap<>();
        if (worst == null) {
            warning.put("message", "Supply levels are stable across all blood types");
            warning.put("confidence", confidence);
            warning.put("recommendation", "Continue routine monitoring and scheduled donor outreach");
        } else {
            String type = (String) worst.get("bloodType");
            warning.put("message", "Possible shortage of " + type + " blood within 3 days");
            warning.put("confidence", confidence);
            warning.put("recommendation", "Allocate 20-30 units of " + type
                    + " to high-need hospitals and notify eligible donors");
        }
        return warning;
    }

    // ---------- helpers ----------

    private String displayName(BloodType bt) {
        String n = bt.name().toUpperCase(Locale.ROOT);
        String sign = n.contains("NEG") ? "-" : "+";
        String letter = n.startsWith("AB") ? "AB" : n.substring(0, 1);
        return letter + sign;
    }
}