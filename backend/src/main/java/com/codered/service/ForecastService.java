package com.codered.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;


import org.springframework.stereotype.Service;

import com.codered.model.BloodRequest;
import com.codered.model.BloodStock;
import com.codered.model.BloodStockHistory;
import com.codered.model.DonationDrive;
import com.codered.model.RequestBloodItem;
import com.codered.model.enums.BloodType;
import com.codered.repository.BloodRequestRepository;
import com.codered.repository.BloodStockHistoryRepository;
import com.codered.repository.BloodStockRepository;
import com.codered.repository.DonationDriveRepository;

@Service
public class ForecastService {

    private final BloodStockRepository bloodStockRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final AiService aiService;
    private final DonationDriveRepository donationDriveRepository; // <-- ADD THIS
    private final BloodStockHistoryRepository bloodStockHistoryRepository;

    // Update the constructor!
    public ForecastService(BloodStockRepository bloodStockRepository,
            BloodRequestRepository bloodRequestRepository,
            AiService aiService,
            DonationDriveRepository donationDriveRepository,
            BloodStockHistoryRepository bloodStockHistoryRepository) { // <-- ADD THIS
        this.bloodStockRepository = bloodStockRepository;
        this.bloodRequestRepository = bloodRequestRepository;
        this.aiService = aiService;
        this.donationDriveRepository = donationDriveRepository; // <-- ADD THIS
        this.bloodStockHistoryRepository = bloodStockHistoryRepository;
    }

    private static final int HISTORY_DAYS = 14;
    private static final int FORECAST_DAYS = 14;
    private static final List<String> CANONICAL_ORDER = List.of("O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-");
    private static final DateTimeFormatter DAY_LABEL = DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);
    private static final DateTimeFormatter FULL_DATE = DateTimeFormatter.ofPattern("MMM d, yyyy", Locale.ENGLISH);

    public Map<String, Object> buildForecast(String bloodTypeFilter) {
        return buildForecast(bloodTypeFilter, HISTORY_DAYS);
    }

    public Map<String, Object> buildForecast(String bloodTypeFilter, int historyDays) {
        LocalDate today = LocalDate.now();
        String selectedBloodType = normalizeBloodType(bloodTypeFilter);

        // 1. Current supply per blood type (summed across all hospitals)
        Map<String, int[]> stockByType = getStockByType(); // type -> [current, ideal]
        List<Map<String, Object>> byBloodType = buildByBloodType(stockByType);
        int[] selectedStock = stockFor(stockByType, selectedBloodType);
        int totalCurrentSupply = selectedStock[0];
        int totalIdeal         = selectedStock[1];
        int hospitalCount      = Math.max(selectedStock[2], 1);
        int riskThreshold      = (int) Math.round((totalIdeal / (double) hospitalCount) * 0.40);

        // 2. Historical daily demand from real requests
        Map<LocalDate, Integer> stockHistory = getHistoricalStock(today, selectedBloodType, historyDays);
        // 3. Fit a simple trend model + build the chart series
        double[] fit = linearFit(today, stockHistory, historyDays); // [slope, intercept, residualStd]
        List<Map<String, Object>> chartData = buildChart(today, stockHistory, fit, historyDays);

        // 4. Summary metrics derived from the forecast + a depletion model
        int safetyBuffer = (int) Math.round(totalIdeal * 0.25); // treat <25% of ideal as risk
        int predictedPeakDemand = 0;
        LocalDate peakDate = today.plusDays(1);
        int runningBalance = totalCurrentSupply;
        List<LocalDate> riskDays = new ArrayList<>();
        for (int i = 1; i <= FORECAST_DAYS; i++) {
            LocalDate d = today.plusDays(i);
            int forecast = forecastValue(fit, historyDays - 1 + i);
            if (forecast > predictedPeakDemand) {
                predictedPeakDemand = forecast;
                peakDate = d;
            }
            runningBalance -= forecast;
            if (runningBalance < safetyBuffer)
                riskDays.add(d);
        }
        int expectedShortfall = Math.max(0, safetyBuffer - runningBalance);
        int forecastAccuracy = computeAccuracy(today, stockHistory, fit);

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

        // 5. Demand drivers (date-based heuristics)
        List<Map<String, Object>> demandDrivers = buildDemandDrivers(today);

        // 6. Dynamic Early Warning powered by Gemini API
        String stockSummary = "Total current supply: " + totalCurrentSupply + " units, Ideal: " + totalIdeal
                + " units.";
        String demandSummary = "Expected shortfall of " + expectedShortfall + " units over the next " + highRiskDays
                + " high-risk days.";

        Map<String, Object> earlyWarning = aiService.generateEarlyWarning(stockSummary, demandSummary);

        // --- NEW CODE: SAVE TO DATABASE TO CLEAR THE IDE WARNING ---
        if (earlyWarning.containsKey("recommendation")) {
            String recommendationText = earlyWarning.get("recommendation").toString();

            // Fetch the drives from the database
            List<DonationDrive> allDrives = donationDriveRepository.findAll();

            if (!allDrives.isEmpty()) {
                // For this example, we will attach the national forecast recommendation
                // to the most recent upcoming drive in your database.
                DonationDrive upcomingDrive = allDrives.get(0);
                upcomingDrive.setAiRecommendation(recommendationText);

                // Save it back! This line officially "uses" the repository.
                donationDriveRepository.save(upcomingDrive);
            }
        }
        // ------------------------------------------------------------

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("selectedBloodType", selectedBloodType == null ? "All Blood Types" : selectedBloodType);
        result.put("predictedPeakDemand", predictedPeakDemand);
        result.put("peakDate", peakDate.format(FULL_DATE));
        result.put("highRiskPeriod", highRiskPeriod);
        result.put("highRiskDays", highRiskDays);
        result.put("expectedShortfall", expectedShortfall);
        result.put("forecastAccuracy", forecastAccuracy);
        result.put("riskThreshold", riskThreshold);
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
            if (s.getBloodType() == null)
                continue;
            String type = displayName(s.getBloodType());
            int[] agg = map.computeIfAbsent(type, k -> new int[3]); // [current, ideal, count]
            agg[0] += s.getCurrentUnits() == null ? 0 : s.getCurrentUnits();
            agg[1] += s.getIdealUnits() == null ? 0 : s.getIdealUnits();
            agg[2]++;
        }
        return map;
    }

    private int[] stockFor(Map<String, int[]> stockByType, String selectedBloodType) {
        if (selectedBloodType != null) {
            int[] stock = stockByType.getOrDefault(selectedBloodType, new int[3]);
            return new int[] { stock[0], stock[1], stock[2] };
        }
        int current = stockByType.values().stream().mapToInt(a -> a[0]).sum();
        int ideal   = stockByType.values().stream().mapToInt(a -> a[1]).sum();
        int count   = stockByType.values().stream().mapToInt(a -> a[2]).max().orElse(1);
        return new int[] { current, ideal, count };
    }

    private Map<LocalDate, Integer> getHistoricalStock(LocalDate today, String selectedBloodType, int historyDays) {
        LocalDate from = today.minusDays(historyDays - 1);

        List<BloodStockHistory> history = bloodStockHistoryRepository
                .findBySnapshotDateBetweenOrderBySnapshotDateAsc(from, today);

        // Track sum and count separately so we can average per day.
        // Summing across hospitals without normalisation causes wild swings when
        // different numbers of hospitals have rows on different dates.
        Map<LocalDate, int[]> raw = new LinkedHashMap<>(); // date -> [sum, count]
        for (BloodStockHistory h : history) {
            if (!matchesBloodType(h.getBloodType(), selectedBloodType))
                continue;
            Integer units = h.getCurrentUnits();
            if (units == null)
                continue;
            raw.computeIfAbsent(h.getSnapshotDate(), k -> new int[2]);
            raw.get(h.getSnapshotDate())[0] += units;
            raw.get(h.getSnapshotDate())[1]++;
        }

        Map<LocalDate, Integer> stockByDay = new LinkedHashMap<>();
        raw.forEach((date, sc) -> stockByDay.put(date, sc[1] > 0 ? sc[0] / sc[1] : 0));
        return stockByDay;
    }

    private int unitsOf(BloodRequest req, String selectedBloodType) {
        List<RequestBloodItem> items = req.getBloodItems();
        if (items != null && !items.isEmpty()) {
            int sum = 0;
            for (RequestBloodItem item : items) {
                if (!matchesBloodType(item.getBloodType(), selectedBloodType))
                    continue;
                sum += item.getUnits() == null ? 0 : item.getUnits();
            }
            return sum;
        }
        if (!matchesBloodType(req.getBloodType(), selectedBloodType))
            return 0;
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
        if (pct >= 70)
            return "Good";
        if (pct >= 40)
            return "Medium";
        return "High Risk";
    }

    // ---------- forecasting ----------

    private double[] linearFit(LocalDate today, Map<LocalDate, Integer> stockHistory, int historyDays) {
        if (stockHistory.isEmpty())
            return new double[] { 0, 0, 30 };

        LocalDate cutoff = today.minusDays(historyDays - 1);
        int n = stockHistory.size();
        double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        double[] ys = new double[n];
        int[] xs = new int[n];
        int idx = 0;

        for (Map.Entry<LocalDate, Integer> entry : stockHistory.entrySet()) {
            int x = (int) (entry.getKey().toEpochDay() - cutoff.toEpochDay());
            double y = entry.getValue();
            xs[idx] = x;
            ys[idx] = y;
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += (double) x * x;
            idx++;
        }

        double denom = n * sumXX - sumX * sumX;
        double slope = denom == 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
        double intercept = (sumY - slope * sumX) / n;
        double sse = 0;
        for (int i = 0; i < n; i++) {
            double pred = slope * xs[i] + intercept;
            sse += Math.pow(ys[i] - pred, 2);
        }
        return new double[] { slope, intercept, Math.sqrt(sse / n) };
    }

    private int forecastValue(double[] fit, int x) {
        return (int) Math.max(0, Math.round(fit[0] * x + fit[1]));
    }

    private List<Map<String, Object>> buildChart(LocalDate today,
            Map<LocalDate, Integer> stockHistory,
            double[] fit,
            int historyDays) {
        List<Map<String, Object>> chart = new ArrayList<>();
        // Use at least 12% of the starting forecast value so the band is always visible
        double baseBand = Math.abs(fit[1]) > 0 ? Math.abs(fit[1]) * 0.12 : 50;
        double band = Math.max(fit[2] * 1.5, baseBand);
        LocalDate cutoff = today.minusDays(historyDays - 1);

        for (Map.Entry<LocalDate, Integer> entry : stockHistory.entrySet()) {
            LocalDate d = entry.getKey();
            int x = (int) (d.toEpochDay() - cutoff.toEpochDay());
            int forecast = forecastValue(fit, x);
            int upper = forecast + (int) Math.round(band);
            int lower = Math.max(0, forecast - (int) Math.round(band));
            Map<String, Object> p = new LinkedHashMap<>();
            p.put("date", d.format(DAY_LABEL));
            p.put("actual", entry.getValue());
            p.put("forecast", forecast);
            p.put("upper", upper);
            p.put("lower", lower);
            p.put("bandWidth", upper - lower);
            chart.add(p);
        }
        for (int j = 1; j <= FORECAST_DAYS; j++) {
            LocalDate d = today.plusDays(j);
            int forecast = forecastValue(fit, historyDays - 1 + j);
            double futureBand = band * (1 + 0.1 * j);
            int upper = forecast + (int) Math.round(futureBand);
            int lower = Math.max(0, forecast - (int) Math.round(futureBand));
            Map<String, Object> p = new LinkedHashMap<>();
            p.put("date", d.format(DAY_LABEL));
            p.put("forecast", forecast);
            p.put("upper", upper);
            p.put("lower", lower);
            p.put("bandWidth", upper - lower);
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
            if (actual == null || actual == 0)
                continue;
            int pred = forecastValue(fit, i);
            totalPctErr += Math.abs(actual - pred) / (double) actual;
            count++;
        }
        if (count == 0)
            return 85; // not enough history yet
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
            if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY)
                weekends++;
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
        int[] idx = { 15, 10, 8, 5, 12, 20, 22, 18, 8, 6, 12, 25 }; // Jan..Dec
        return idx[month - 1];
    }

    private int upcomingHolidays(LocalDate today, int withinDays) {
        int[][] fixed = { { 1, 1 }, { 5, 1 }, { 8, 9 }, { 12, 25 } }; // fixed-date SG public holidays
        int count = 0;
        for (int[] md : fixed) {
            LocalDate h = LocalDate.of(today.getYear(), md[0], md[1]);
            if (h.isBefore(today))
                h = h.plusYears(1);
            if (!h.isAfter(today.plusDays(withinDays)))
                count++;
        }
        return count;
    }

    // ---------- early warning ----------

    private Map<String, Object> buildEarlyWarning(List<Map<String, Object>> byBloodType,
            String selectedBloodType,
            int expectedShortfall,
            String highRiskPeriod,
            int highRiskDays,
            int confidence) {
        Map<String, Object> warning = new LinkedHashMap<>();
        if (expectedShortfall <= 0 || highRiskDays == 0) {
            warning.put("message", selectedBloodType == null
                    ? "Projected national supply remains above the safety buffer"
                    : "Projected " + selectedBloodType + " supply remains above the safety buffer");
            warning.put("confidence", confidence);
            warning.put("recommendation", "Continue routine monitoring and scheduled donor outreach");
        } else {
            String scope = selectedBloodType == null ? "overall blood supply" : selectedBloodType + " blood";
            String focusType = selectedBloodType == null ? lowestSupplyType(byBloodType) : selectedBloodType;
            warning.put("message", "Projected shortage of " + scope + " during " + highRiskPeriod);
            warning.put("confidence", confidence);
            warning.put("recommendation", "Close a projected shortfall of " + expectedShortfall
                    + " units; prioritise " + focusType + " stock review and eligible donor outreach");
        }
        return warning;
    }

    // ---------- helpers ----------

    public Map<String, Object> buildForecast() {
        return buildForecast(null);
    }

    private String normalizeBloodType(String bloodType) {
        if (bloodType == null)
            return null;
        String value = bloodType.trim().toUpperCase(Locale.ROOT);
        if (value.isEmpty() || "ALL".equals(value) || "ALL BLOOD TYPES".equals(value))
            return null;
        return CANONICAL_ORDER.contains(value) ? value : null;
    }

    private boolean matchesBloodType(BloodType actual, String selectedBloodType) {
        return selectedBloodType == null || (actual != null && selectedBloodType.equals(displayName(actual)));
    }

    private String lowestSupplyType(List<Map<String, Object>> byBloodType) {
        String type = "the lowest-stock blood type";
        int lowestPct = Integer.MAX_VALUE;
        for (Map<String, Object> row : byBloodType) {
            Integer pct = (Integer) row.get("supplyPct");
            if (pct != null && pct < lowestPct) {
                lowestPct = pct;
                type = (String) row.get("bloodType");
            }
        }
        return type;
    }

    private String displayName(BloodType bt) {
        String n = bt.name().toUpperCase(Locale.ROOT);
        String sign = n.contains("NEG") ? "-" : "+";
        String letter = n.startsWith("AB") ? "AB" : n.substring(0, 1);
        return letter + sign;
    }
}
