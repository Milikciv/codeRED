package com.codered.config;

import com.codered.model.*;
import com.codered.model.enums.*;
import com.codered.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;
    private final BloodStockRepository bloodStockRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final AlertRepository alertRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    private final SrcAlertRepository srcAlertRepository;
    private final DonationDriveRepository donationDriveRepository;
    private final DonorDemographicRepository donorDemographicRepository;
    private final DonorHotspotRepository donorHotspotRepository;
    private final RecommendedDriveRepository recommendedDriveRepository;

    @Override
    public void run(String... args) {
        migrateLegacyHospitalUsers();
        ensureAdminExists();
        ensureSrcExists();
        ensureHsaExists();
        if (hospitalRepository.count() > 1) {
            ensureMultiTypeRequestsExist();
            ensureSrcDataExists();
            return;
        }
        seedHospitals();
        seedUsers();
        seedBloodStock();
        seedRequests();
        seedAlerts();
        seedSrcData();
    }

    // ── ensure methods (idempotent backfills) ────────────────────────────

    private void ensureSrcDataExists() {
        if (srcAlertRepository.count() == 0)          seedSrcAlerts();
        if (donationDriveRepository.count() == 0)     seedDonationDrives();
        if (donorDemographicRepository.count() == 0)  seedDonorDemographics();
        if (donorHotspotRepository.count() == 0)      seedDonorHotspots();
        if (recommendedDriveRepository.count() == 0)  seedRecommendedDrive();
    }

    private void seedSrcData() {
        seedSrcAlerts();
        seedDonationDrives();
        seedDonorDemographics();
        seedDonorHotspots();
        seedRecommendedDrive();
    }

    // ── src_alerts ───────────────────────────────────────────────────────

    private void seedSrcAlerts() {
        Object[][] alerts = {
            {"ALT-2505-001", "O-",  "Critical", 420, "21–27 May 2026",
             "Organise donor drives targeting O- donors",              "30 May 2026, 08:15 AM"},
            {"ALT-2505-002", "B+",  "High",     280, "28 May – 3 Jun 2026",
             "Increase B+ donor outreach via SMS campaigns",           "29 May 2026, 02:30 PM"},
            {"ALT-2505-003", "A-",  "Medium",   150, "4–10 Jun 2026",
             "Schedule targeted outreach for A- eligible donors",      "28 May 2026, 11:00 AM"},
            {"ALT-2505-004", "O+",  "High",     310, "7–13 Jun 2026",
             "Plan donation drives at high-density residential areas", "27 May 2026, 09:45 AM"},
        };
        for (Object[] row : alerts) {
            SrcAlert a = new SrcAlert();
            a.setAlertCode((String) row[0]);
            a.setBloodType((String) row[1]);
            a.setSeverity((String) row[2]);
            a.setForecastedShortage((Integer) row[3]);
            a.setShortageWindow((String) row[4]);
            a.setRecommendedAction((String) row[5]);
            a.setReceivedAt((String) row[6]);
            a.setStatus("Active");
            srcAlertRepository.save(a);
        }
    }

    // ── donation_drives ──────────────────────────────────────────────────

    private void seedDonationDrives() {
        // Upcoming drives
        seedDrive("DD-001", "Tampines Community Plaza",
            "Tampines Street 11, Singapore 529455", "O-",
            80, 100, 45, "ALT-2505-001",
            "31 May 2026", "10:00 AM", "4:00 PM", "Planned",
            true, 312, 3, true,
            "Drive targeting O- donors in response to critical shortage alert. Venue booked, awaiting more registrations.",
            null, null, null,
            420, 180, 240, 43, 87, "30 May 2026, 08:15 AM", 86, 18, 180, 21);

        seedDrive("DD-002", "Jurong East Sports Centre",
            "21 Jurong East Street 31, Singapore 609517", "B+",
            70, 90, 28, "ALT-2505-002",
            "7 Jun 2026", "9:00 AM", "3:00 PM", "Planned",
            true, 245, 2, true,
            "B+ shortage drive. Second outreach wave scheduled for 3 Jun to boost registrations.",
            null, null, null,
            260, 120, 140, 46, 82, "29 May 2026, 02:30 PM", 72, 15, 120, 21);

        seedDrive("DD-003", "Woodlands Galaxy CC",
            "31 Woodlands Avenue 6, Singapore 738991", "A-",
            60, 80, 61, "ALT-2505-003",
            "14 Jun 2026", "10:00 AM", "5:00 PM", "Confirmed",
            true, 198, 4, true,
            "Drive confirmed. All logistics in place. Staff briefing scheduled for 13 Jun.",
            null, null, null,
            150, 90, 60, 60, 79, "28 May 2026, 11:00 AM", 65, 14, 90, 22);

        // History drives (Completed)
        seedDrive("DD-H001", "Tampines Hub",
            "Tampines Avenue 4", "O-",
            80, 120, null, "ALT-2505-001",
            "26 Apr 2026", "10:00 AM", "5:00 PM", "Completed",
            true, 0, 3, true, null,
            112, 96, 45,
            null, null, null, null, null, null, null, null, null, null);

        seedDrive("DD-H002", "Jurong East Sports Centre",
            "21 Jurong East Street 31", "B+",
            80, 120, null, "ALT-2505-002",
            "13 Apr 2026", "10:00 AM", "4:00 PM", "Completed",
            true, 0, 3, true, null,
            98, 82, 42,
            null, null, null, null, null, null, null, null, null, null);

        seedDrive("DD-H003", "Causeway Point Atrium",
            "1 Woodlands Square", "A-",
            70, 90, null, "ALT-2505-003",
            "30 Mar 2026", "10:00 AM", "4:00 PM", "Completed",
            true, 0, 2, true, null,
            76, 63, 37,
            null, null, null, null, null, null, null, null, null, null);

        seedDrive("DD-H004", "Bedok Community Centre",
            "850 New Upper Changi Rd", "O+",
            70, 90, null, "ALT-2505-004",
            "16 Mar 2026", "10:00 AM", "4:00 PM", "Completed",
            true, 0, 3, true, null,
            85, 71, 40,
            null, null, null, null, null, null, null, null, null, null);
    }

    private void seedDrive(String code, String location, String address, String bloodType,
                           int expMin, int expMax, Integer confirmed, String alertCode,
                           String date, String startTime, String endTime, String status,
                           boolean outreachSent, int outreachCount, int staff, boolean venueConfirmed,
                           String notes,
                           Integer actualTurnout, Integer unitsCollected, Integer conversionRate,
                           Integer hsaShortage, Integer expectedCollection, Integer shortfall,
                           Integer progressPct, Integer outreachConfidence, String outreachLastUpdated,
                           Integer outreachRecipients, Integer expectedResponders,
                           Integer expectedUnits, Integer outreachResponseRate) {
        DonationDrive d = new DonationDrive();
        d.setDriveCode(code);
        d.setLocation(location);
        d.setAddress(address);
        d.setBloodType(bloodType);
        d.setExpectedDonorsMin(expMin);
        d.setExpectedDonorsMax(expMax);
        d.setConfirmedDonors(confirmed);
        d.setLinkedAlertCode(alertCode);
        d.setDate(date);
        d.setStartTime(startTime);
        d.setEndTime(endTime);
        d.setStatus(status);
        d.setOutreachSent(outreachSent);
        d.setOutreachCount(outreachCount);
        d.setStaffAssigned(staff);
        d.setVenueConfirmed(venueConfirmed);
        d.setNotes(notes);
        d.setActualTurnout(actualTurnout);
        d.setUnitsCollected(unitsCollected);
        d.setConversionRate(conversionRate);
        d.setHsaShortage(hsaShortage);
        d.setExpectedCollection(expectedCollection);
        d.setShortfall(shortfall);
        d.setProgressPct(progressPct);
        d.setOutreachConfidence(outreachConfidence);
        d.setOutreachLastUpdated(outreachLastUpdated);
        d.setOutreachRecipients(outreachRecipients);
        d.setExpectedResponders(expectedResponders);
        d.setExpectedUnits(expectedUnits);
        d.setOutreachResponseRate(outreachResponseRate);
        donationDriveRepository.save(d);
    }

    // ── donor_demographics ───────────────────────────────────────────────

    private void seedDonorDemographics() {
        // summary
        saveDemographic("summary", "activeDonors",   128450L, null, null, null, null, 1);
        saveDemographic("summary", "eligibleRepeat",  74320L, null, null, null, null, 2);
        saveDemographic("summary", "dormant",         54130L, null, null, null, null, 3);
        saveDemographic("summary", "responseRate",     null,  28.7, null, null, null, 4);

        // blood_type
        saveDemographic("blood_type", "O+",  44150L, 34.4, null, null, null, 1);
        saveDemographic("blood_type", "A+",  32620L, 25.4, null, null, null, 2);
        saveDemographic("blood_type", "B+",  20340L, 15.9, null, null, null, 3);
        saveDemographic("blood_type", "O-",   8950L,  7.0, null, null, null, 4);
        saveDemographic("blood_type", "A-",   7560L,  5.9, null, null, null, 5);
        saveDemographic("blood_type", "AB+",  7020L,  5.5, null, null, null, 6);
        saveDemographic("blood_type", "B-",   4120L,  3.2, null, null, null, 7);
        saveDemographic("blood_type", "AB-",  3690L,  2.7, null, null, null, 8);

        // age
        saveDemographic("age", "16-20",  5420L,  4.2, null, null, null, 1);
        saveDemographic("age", "21-30", 37980L, 29.6, null, null, null, 2);
        saveDemographic("age", "31-40", 34430L, 26.8, null, null, null, 3);
        saveDemographic("age", "41-50", 28400L, 22.1, null, null, null, 4);
        saveDemographic("age", "51-60", 17470L, 13.6, null, null, null, 5);
        saveDemographic("age", "60+",    4750L,  3.7, null, null, null, 6);

        // location
        saveDemographic("location", "Tampines",    18560L, null, 1, 1.3540, 103.9440, null, 1);
        saveDemographic("location", "Jurong East", 15230L, null, 2, 1.3333, 103.7420, null, 2);
        saveDemographic("location", "Woodlands",   12480L, null, 3, 1.4382, 103.7891, null, 3);
        saveDemographic("location", "Ang Mo Kio",  10390L, null, 4, 1.3696, 103.8454, null, 4);
        saveDemographic("location", "Bedok",        8760L, null, 5, 1.3239, 103.9290, null, 5);

        // response_rate
        saveDemographic("response_rate", "Dec 2025", null, null, null, null, null, 23.1, 1);
        saveDemographic("response_rate", "Jan 2026", null, null, null, null, null, 24.0, 2);
        saveDemographic("response_rate", "Feb 2026", null, null, null, null, null, 25.3, 3);
        saveDemographic("response_rate", "Mar 2026", null, null, null, null, null, 26.1, 4);
        saveDemographic("response_rate", "Apr 2026", null, null, null, null, null, 25.9, 5);
        saveDemographic("response_rate", "May 2026", null, null, null, null, null, 28.7, 6);
    }

    private void saveDemographic(String category, String label, Long count, Double pct,
                                  Integer rank, Double lat, Double lon, Double rate, int sortOrder) {
        DonorDemographic d = new DonorDemographic();
        d.setCategory(category);
        d.setLabel(label);
        d.setCount(count);
        d.setPercentage(pct);
        d.setRank(rank);
        d.setLatitude(lat);
        d.setLongitude(lon);
        d.setRate(rate);
        d.setSortOrder(sortOrder);
        donorDemographicRepository.save(d);
    }

    // ── donor_hotspots ───────────────────────────────────────────────────

    private void seedDonorHotspots() {
        Object[][] hotspots = {
            // rank, name, score, lat, lon, activeDonors, venue, eligibleDonors, successRate
            {1, "Tampines",    86, 1.3540, 103.9440, 18560, "Tampines Community Plaza", 86, 72},
            {2, "Jurong East", 78, 1.3333, 103.7420, 15230, "JEM (Level 1)",             72, 65},
            {3, "Woodlands",   72, 1.4382, 103.7891, 12480, "Woodlands Civic Centre",    65, 63},
            {4, "Ang Mo Kio",  65, 1.3696, 103.8454, 10390, "AMK Hub",                   58, 59},
            {5, "Bukit Batok", 58, 1.3590, 103.7637,  8200, "Beauty World Plaza",        48, 52},
        };
        for (Object[] row : hotspots) {
            DonorHotspot h = new DonorHotspot();
            h.setRank((Integer) row[0]);
            h.setName((String) row[1]);
            h.setScore((Integer) row[2]);
            h.setLatitude((Double) row[3]);
            h.setLongitude((Double) row[4]);
            h.setActiveDonorCount((Integer) row[5]);
            h.setVenue((String) row[6]);
            h.setEligibleDonors((Integer) row[7]);
            h.setSuccessRate((Integer) row[8]);
            donorHotspotRepository.save(h);
        }
    }

    // ── recommended_drives ───────────────────────────────────────────────

    private void seedRecommendedDrive() {
        RecommendedDrive rd = new RecommendedDrive();
        rd.setAlertCode("ALT-2505-001");
        rd.setLocation("Tampines Community Plaza");
        rd.setBloodType("O-");
        rd.setDate("Sat, 31 May 2026");
        rd.setStartTime("10:00 AM");
        rd.setEndTime("4:00 PM");
        rd.setEligibleDonors(86);
        rd.setHighResponseDonors(18);
        rd.setPastSuccessRate(72);
        rd.setConfidenceScore(87);
        rd.setImpact("High Impact");
        recommendedDriveRepository.save(rd);

        String[][] reasons = {
            {"High eligible donor density",    "Large pool of O- donors within 5km"},
            {"Low recent donation activity",   "Lower donation rate in the past 12 weeks"},
            {"Excellent accessibility",        "Near MRT & bus interchange"},
            {"Nearby amenities",               "Close to schools, offices & community centres"},
            {"Strong past performance",        "High turnout and conversion in previous drives"},
        };
        for (String[] r : reasons) {
            RecommendedDriveReason reason = new RecommendedDriveReason();
            reason.setRecommendedDrive(rd);
            reason.setLabel(r[0]);
            reason.setDetail(r[1]);
            rd.getReasons().add(reason);
        }

        Object[][] breakdown = {
            {"Eligible donor density",      30, 28},
            {"Low recent donation activity", 25, 22},
            {"Accessibility",               20, 17},
            {"Nearby amenities",            15, 10},
            {"Past drive success",          10,  9},
        };
        for (Object[] b : breakdown) {
            RecommendedDriveScoreBreakdown s = new RecommendedDriveScoreBreakdown();
            s.setRecommendedDrive(rd);
            s.setCriterion((String) b[0]);
            s.setWeight((Integer) b[1]);
            s.setScore((Integer) b[2]);
            rd.getScoreBreakdown().add(s);
        }

        recommendedDriveRepository.save(rd);
    }

    // ── existing methods (unchanged) ─────────────────────────────────────

    private void migrateLegacyHospitalUsers() {
        jdbcTemplate.update("UPDATE users SET role = 'SRC_STAFF' WHERE role IN ('HOSPITAL_STAFF', 'HOSPITAL_ADMIN')");
    }

    private void ensureAdminExists() {
        if (userRepository.findByEmail("admin@codered.sg").isPresent()) return;
        User admin = new User();
        admin.setEmail("admin@codered.sg");
        admin.setPassword(passwordEncoder.encode("password123"));
        admin.setName("Admin");
        admin.setRole(UserRole.ADMIN);
        admin.setDesignation("System Administrator");
        userRepository.save(admin);
    }

    private void ensureSrcExists() {
        if (userRepository.findByEmail("winnie@redcross.org.sg").isPresent()) return;

        User src = new User();
        src.setEmail("winnie@redcross.org.sg");
        src.setPassword(passwordEncoder.encode("password123"));
        src.setName("Winnie Koh");
        src.setRole(UserRole.SRC_STAFF);
        src.setDesignation("SRC Staff");
        userRepository.save(src);
    }

    private void ensureMultiTypeRequestsExist() {
        Hospital sgh = hospitalRepository.findByCode("SGH").orElseThrow();

        bloodRequestRepository.findByRequestId("REQ-3330").ifPresentOrElse(r -> {
            if (r.getBloodItems().isEmpty()) {
                addBloodItems(r, new BloodType[]{BloodType.O_POSITIVE, BloodType.B_POSITIVE, BloodType.A_NEGATIVE}, new int[]{20, 10, 5});
                r.setUnitsRequested(35);
                bloodRequestRepository.save(r);
            }
        }, () -> saveMultiTypeRequest("REQ-3330", sgh, Priority.CRITICAL, RequestStatus.PENDING,
            "Mass casualty event — multiple patients requiring different blood products.",
            LocalDateTime.now().minusHours(2),
            new BloodType[]{BloodType.O_POSITIVE, BloodType.B_POSITIVE, BloodType.A_NEGATIVE},
            new int[]{20, 10, 5}));

        bloodRequestRepository.findByRequestId("REQ-4976").ifPresentOrElse(r -> {
            if (r.getBloodItems().isEmpty()) {
                addBloodItems(r, new BloodType[]{BloodType.B_POSITIVE, BloodType.O_POSITIVE}, new int[]{20, 10});
                r.setUnitsRequested(30);
                bloodRequestRepository.save(r);
            }
        }, () -> saveMultiTypeRequest("REQ-4976", sgh, Priority.CRITICAL, RequestStatus.PENDING,
            "Cardiac surgery and trauma cases requiring multiple blood types.",
            LocalDateTime.now().minusHours(10),
            new BloodType[]{BloodType.B_POSITIVE, BloodType.O_POSITIVE},
            new int[]{20, 10}));
    }

    private void addBloodItems(BloodRequest req, BloodType[] bloodTypes, int[] units) {
        for (int i = 0; i < bloodTypes.length; i++) {
            RequestBloodItem item = new RequestBloodItem();
            item.setBloodRequest(req);
            item.setBloodType(bloodTypes[i]);
            item.setUnits(units[i]);
            req.getBloodItems().add(item);
        }
    }

    private void ensureHsaExists() {
        if (hospitalRepository.findByCode("HSA").isPresent()) return;
        Hospital hsa = new Hospital();
        hsa.setCode("HSA");
        hsa.setName("HSA Blood Services");
        hsa.setAddress("11 Outram Road, Singapore 169078");
        hospitalRepository.save(hsa);

        int[] hsaStock = {1200, 600, 1500, 400, 700, 500, 900, 250};
        int[] hsaIdeal = {3000, 1500, 4000, 1000, 2000, 1200, 2000, 600};
        BloodType[] types = BloodType.values();
        for (int j = 0; j < types.length; j++) {
            BloodStock stock = new BloodStock();
            stock.setHospital(hsa);
            stock.setBloodType(types[j]);
            stock.setCurrentUnits(hsaStock[j]);
            stock.setIdealUnits(hsaIdeal[j]);
            stock.setUpdatedAt(LocalDateTime.now());
            bloodStockRepository.save(stock);
        }
    }

    private void seedHospitals() {
        String[][] hospitals = {
            {"HSA",  "HSA Blood Services",                  "11 Outram Road, Singapore 169078"},
            {"SGH",  "Singapore General Hospital",          "Outram Rd, Singapore 169608"},
            {"NUH",  "National University Hospital",        "5 Lower Kent Ridge Rd, Singapore 119074"},
            {"KKH",  "KK Women's and Children's Hospital",  "100 Bukit Timah Rd, Singapore 229899"},
            {"CGH",  "Changi General Hospital",             "2 Simei Street 3, Singapore 529889"},
            {"NGH",  "Ng Teng Fong General Hospital",       "1 Jurong East St 21, Singapore 609606"},
            {"TTSH", "Tan Tock Seng Hospital",              "11 Jln Tan Tock Seng, Singapore 308433"}
        };
        for (String[] h : hospitals) {
            Hospital hospital = new Hospital();
            hospital.setCode(h[0]);
            hospital.setName(h[1]);
            hospital.setAddress(h[2]);
            hospitalRepository.save(hospital);
        }
    }

    private void seedUsers() {
        User hsa = new User();
        hsa.setEmail("winnie@hsa.gov.sg");
        hsa.setPassword(passwordEncoder.encode("password123"));
        hsa.setName("Winnie Koh");
        hsa.setRole(UserRole.HSA);
        hsa.setDesignation("Blood Services Manager");
        userRepository.save(hsa);

        User src = new User();
        src.setEmail("winnie@redcross.org.sg");
        src.setPassword(passwordEncoder.encode("password123"));
        src.setName("Winnie Koh");
        src.setRole(UserRole.SRC_STAFF);
        src.setDesignation("SRC Staff");
        userRepository.save(src);
    }

    private void seedBloodStock() {
        int[][] stockData = {
            {1200,  600, 1500, 400,  700, 500, 900, 250},
            { 320,  220,  420,  80,  135, 180, 300,  80},
            { 280,  150,  380,  90,  120, 160, 260,  70},
            { 200,  100,  300,  60,   90, 120, 200,  50},
            { 250,  130,  350,  70,  100, 140, 230,  60},
            { 180,   90,  270,  55,   80, 100, 180,  45},
            { 210,  110,  310,  65,   95, 130, 210,  55},
        };
        int[][] idealData = {
            {3000, 1500, 4000, 1000, 2000, 1200, 2000, 600},
            { 400,  300,  500,  200,  300,  350,  400, 200},
            { 380,  280,  470,  190,  280,  330,  370, 190},
            { 300,  220,  380,  150,  220,  260,  290, 150},
            { 340,  250,  430,  170,  250,  300,  330, 170},
            { 280,  200,  360,  140,  200,  240,  270, 140},
            { 310,  230,  400,  160,  230,  280,  310, 160},
        };
        String[] hospitalCodes = {"HSA", "SGH", "NUH", "KKH", "CGH", "NGH", "TTSH"};
        BloodType[] types = BloodType.values();
        for (int i = 0; i < hospitalCodes.length; i++) {
            Hospital hospital = hospitalRepository.findByCode(hospitalCodes[i]).orElseThrow();
            for (int j = 0; j < types.length; j++) {
                BloodStock stock = new BloodStock();
                stock.setHospital(hospital);
                stock.setBloodType(types[j]);
                stock.setCurrentUnits(stockData[i][j]);
                stock.setIdealUnits(idealData[i][j]);
                stock.setUpdatedAt(LocalDateTime.now());
                bloodStockRepository.save(stock);
            }
        }
    }

    private void seedRequests() {
        Hospital sgh  = hospitalRepository.findByCode("SGH").orElseThrow();
        Hospital nuh  = hospitalRepository.findByCode("NUH").orElseThrow();
        Hospital kkh  = hospitalRepository.findByCode("KKH").orElseThrow();
        Hospital ttsh = hospitalRepository.findByCode("TTSH").orElseThrow();
        Hospital cgh  = hospitalRepository.findByCode("CGH").orElseThrow();

        saveMultiTypeRequest("REQ-3330", sgh, Priority.CRITICAL, RequestStatus.PENDING,
            "Mass casualty event — multiple patients requiring different blood products.",
            LocalDateTime.now().minusHours(2),
            new BloodType[]{BloodType.O_POSITIVE, BloodType.B_POSITIVE, BloodType.A_NEGATIVE},
            new int[]{20, 10, 5});

        saveMultiTypeRequest("REQ-4976", sgh, Priority.CRITICAL, RequestStatus.PENDING,
            "Cardiac surgery and trauma cases requiring multiple blood types.",
            LocalDateTime.now().minusHours(10),
            new BloodType[]{BloodType.B_POSITIVE, BloodType.O_POSITIVE},
            new int[]{20, 10});

        Object[][] singleRequests = {
            {"REQ-2109", sgh,  BloodType.O_NEGATIVE, 20, Priority.CRITICAL, RequestStatus.PENDING,
             "Multiple trauma cases due to major road accident.", LocalDateTime.now().minusMinutes(17)},
            {"REQ-2108", kkh,  BloodType.A_POSITIVE, 10, Priority.HIGH,    RequestStatus.PENDING,
             "Paediatric surgery cases.", LocalDateTime.now().minusMinutes(32)},
            {"REQ-2107", ttsh, BloodType.B_POSITIVE, 10, Priority.MEDIUM,  RequestStatus.PENDING,
             "Scheduled surgeries.", LocalDateTime.now().minusMinutes(32)},
            {"REQ-2106", cgh,  BloodType.O_NEGATIVE, 10, Priority.MEDIUM,  RequestStatus.IN_TRANSIT,
             "Post Surgical Care", LocalDateTime.now().minusMinutes(32)},
            {"REQ-2105", nuh,  BloodType.O_POSITIVE, 20, Priority.CRITICAL, RequestStatus.APPROVED,
             "Urgent supply for emergency surgeries.", LocalDateTime.now().minusMinutes(45)},
        };
        for (Object[] r : singleRequests) {
            BloodRequest req = new BloodRequest();
            req.setRequestId((String) r[0]);
            req.setRequestingHospital((Hospital) r[1]);
            req.setBloodType((BloodType) r[2]);
            req.setUnitsRequested((Integer) r[3]);
            req.setPriority((Priority) r[4]);
            req.setStatus((RequestStatus) r[5]);
            req.setReason((String) r[6]);
            req.setRequestedAt((LocalDateTime) r[7]);
            req.setUpdatedAt(LocalDateTime.now());
            req.setNeededBy(LocalDateTime.now().plusHours(2));
            req.setRequestedByName("Dr. James Tan");
            req.setRequestedByDesignation("Head, Emergency Dept");
            bloodRequestRepository.save(req);
        }
    }

    private void saveMultiTypeRequest(String requestId, Hospital hospital, Priority priority,
                                      RequestStatus status, String reason, LocalDateTime requestedAt,
                                      BloodType[] bloodTypes, int[] units) {
        BloodRequest req = new BloodRequest();
        req.setRequestId(requestId);
        req.setRequestingHospital(hospital);
        req.setBloodType(bloodTypes[0]);
        req.setPriority(priority);
        req.setStatus(status);
        req.setReason(reason);
        req.setRequestedAt(requestedAt);
        req.setUpdatedAt(LocalDateTime.now());
        req.setNeededBy(LocalDateTime.now().plusHours(2));
        req.setRequestedByName("Dr. James Tan");
        req.setRequestedByDesignation("Head, Emergency Dept");

        int total = 0;
        for (int i = 0; i < bloodTypes.length; i++) {
            RequestBloodItem item = new RequestBloodItem();
            item.setBloodRequest(req);
            item.setBloodType(bloodTypes[i]);
            item.setUnits(units[i]);
            req.getBloodItems().add(item);
            total += units[i];
        }
        req.setUnitsRequested(total);
        bloodRequestRepository.save(req);
    }

    private void seedAlerts() {
        Hospital sgh = hospitalRepository.findByCode("SGH").orElseThrow();
        Hospital ttsh = hospitalRepository.findByCode("TTSH").orElseThrow();

        Object[][] alertData = {
            {"O- Shortage Predicted...", "O- blood supply at SGH is predicted to fall below safe threshold within 3 days.",
             Priority.CRITICAL, sgh, "SGH"},
            {"O- Shortage Predicted...", "O- blood supply at TTS is predicted to drop. Action recommended.",
             Priority.HIGH, ttsh, "TTS"},
            {"A+ Shortage Predicted...", "A+ blood supply at TTS may reach critical levels next week.",
             Priority.HIGH, ttsh, "TTS"},
            {"Mass Casualty Incident (MCI) reported at ECP",
             "Est. 15+ incoming traumas. Massive immediate demand for O- and O+ packed red blood cells expected.",
             Priority.CRITICAL, sgh, "East Coast Parkway Singapore"},
            {"Cross-Hospital Request Pending",
             "National University Hospital has requested a transfer of 10 units of AB-. Approve or decline based on current 7-day forecast.",
             Priority.HIGH, null, "National University Hospital Singapore"},
            {"Platelet shelf-life expiration wave in 3 days",
             "57 units will expire; consider redistributing to other hospitals if needed.",
             Priority.HIGH, null, "Multiple Locations"},
        };
        for (Object[] a : alertData) {
            Alert alert = new Alert();
            alert.setTitle((String) a[0]);
            alert.setMessage((String) a[1]);
            alert.setPriority((Priority) a[2]);
            alert.setHospital((Hospital) a[3]);
            alert.setLocation((String) a[4]);
            alert.setDismissed(false);
            alert.setCreatedAt(LocalDateTime.now().minusHours(2));
            alertRepository.save(alert);
        }
    }
}
