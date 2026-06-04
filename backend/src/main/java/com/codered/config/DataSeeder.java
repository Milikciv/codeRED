package com.codered.config;

import com.codered.model.*;
import com.codered.model.enums.*;
import com.codered.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

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
    private final RecommendedDriveRepository recommendedDriveRepository;
    private final DonorRepository donorRepository;

    @Override
    public void run(String... args) {
        migrateLegacyHospitalUsers();
        ensureAdminExists();
        ensureSrcExists();
        ensureHsaExists();
        if (hospitalRepository.count() > 1) {
            ensureMultiTypeRequestsExist();
            ensureSrcDataExists();
            ensureAlertsExist();
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
        if (donationDriveRepository.count() == 0)       seedDonationDrives();
        if (donorRepository.count() == 0)               seedDonors();
        if (donorDemographicRepository.count() == 0)    seedResponseRateTrend();
        if (recommendedDriveRepository.count() == 0)    seedRecommendedDrive();
    }

    private void seedSrcData() {
        seedDonationDrives();
        seedDonors();
        seedResponseRateTrend();
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

    // ── donors ───────────────────────────────────────────────────────────

    private void seedDonors() {
        // Regions with coordinates
        String[] regions = {"Tampines", "Jurong East", "Woodlands", "Ang Mo Kio", "Bedok", "Bukit Batok", "Clementi", "Yishun"};
        double[] lats    = {1.3540,     1.3333,        1.4382,      1.3696,        1.3239,  1.3590,        1.3162,      1.4304};
        double[] lons    = {103.9440,   103.7420,      103.7891,    103.8454,      103.9290, 103.7637,     103.7649,    103.8354};

        // Blood type batches: {BloodType ordinal, count}
        // Distribution approximates Singapore prevalence: O+(34%), A+(25%), B+(16%), O-(7%), A-(6%), AB+(5.5%), B-(3.2%), AB-(2.7%)
        int[][] batches = {{0,82},{1,61},{2,38},{3,17},{4,14},{5,13},{6,8},{7,7}};
        BloodType[] bts = BloodType.values();

        // Birth year pool giving target age distribution (16-20: 4%, 21-30: 30%, 31-40: 27%, 41-50: 22%, 51-60: 13%, 60+: 4%)
        // 24-element cycle: 1×60+, 3×51-60, 5×41-50, 7×31-40, 7×21-30, 1×16-20
        int[] birthYears = {
            1961,                               // 60+
            1968, 1971, 1974,                   // 51-60
            1977, 1979, 1981, 1983, 1985,       // 41-50
            1987, 1989, 1990, 1992, 1993, 1995, 1986, // 31-40
            1997, 1999, 2001, 2002, 2004, 1996, 2000, // 21-30
            2007                                // 16-20
        };

        LocalDate today = LocalDate.now();
        int seq = 1;

        for (int[] batch : batches) {
            BloodType bt = bts[batch[0]];
            int count    = batch[1];

            for (int ci = 0; ci < count; ci++) {
                Donor d = new Donor();
                d.setDonorId(String.format("D-%05d", seq++));
                d.setBloodType(bt);

                int ri = (ci + batch[0] * 3) % regions.length;
                d.setRegion(regions[ri]);
                d.setLatitude(lats[ri]);
                d.setLongitude(lons[ri]);

                int birthYear = birthYears[ci % birthYears.length];
                d.setDateOfBirth(LocalDate.of(birthYear, 1 + (ci % 12), 1 + (ci % 15)));

                d.setGender(ci % 2 == 0 ? "Male" : "Female");

                // Status cycle (12-slot): 5 dormant (42%), 2 active-recent (17%), 5 active-eligible (42%)
                int slot = ci % 12;
                if (slot < 5) {
                    // Dormant
                    d.setStatus(DonorStatus.DORMANT);
                    if (slot == 0) {
                        d.setLastDonationDate(null);
                        d.setTotalDonations(0);
                    } else {
                        d.setLastDonationDate(today.minusMonths(13 + (ci % 10)));
                        d.setTotalDonations(1 + (ci % 4));
                    }
                } else if (slot < 7) {
                    // Active, donated recently — not yet eligible for next donation
                    d.setStatus(DonorStatus.ACTIVE);
                    d.setLastDonationDate(today.minusDays(30 + (ci % 50)));
                    d.setTotalDonations(2 + (ci % 6));
                } else {
                    // Active, eligible for repeat donation (last donation 3+ months ago)
                    d.setStatus(DonorStatus.ACTIVE);
                    d.setLastDonationDate(today.minusMonths(4 + (ci % 8)));
                    d.setTotalDonations(3 + (ci % 9));
                }

                d.setRegisteredAt(LocalDate.of(2019 + (ci % 6), 1 + (ci % 12), 1 + (ci % 15)));
                donorRepository.save(d);
            }
        }
    }

    // ── response rate trend (historical outreach campaign data) ──────────

    private void seedResponseRateTrend() {
        double[] rates  = {23.1, 24.0, 25.3, 26.1, 25.9, 28.7};
        String[] months = {"Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026", "Apr 2026", "May 2026"};
        for (int i = 0; i < months.length; i++) {
            DonorDemographic r = new DonorDemographic();
            r.setCategory("response_rate");
            r.setLabel(months[i]);
            r.setRate(rates[i]);
            r.setSortOrder(i + 1);
            donorDemographicRepository.save(r);
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
            {"Eligible donor density",       30, 28},
            {"Low recent donation activity", 25, 22},
            {"Accessibility",                20, 17},
            {"Nearby amenities",             15, 10},
            {"Past drive success",           10,  9},
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

    private void ensureAlertsExist() {
        if (alertRepository.count() == 0) seedAlerts();
    }

    private void seedAlerts() {
        // {alertId, bloodType, priority, alertStatus, title, message, reason,
        //  recommendedAction, supportingText, defaultNotes,
        //  forecastedShortage, windowStart, windowEnd,
        //  safeSupplyThreshold, projectedSupply, forecastConfidence, recommendedDrives}
        Object[][] data = {
            {"ALT-2605-001", "O-",  Priority.CRITICAL, "Draft",
             "O- Blood Shortage Alert",
             "O- demand is projected to exceed the safe supply threshold within the next 7 days.",
             "Demand is projected to exceed the safe supply threshold for O- blood over the next 7 days.",
             "Organise 2 donor drives targeting O- donors.",
             "This will help close the projected shortfall and maintain a safe supply.",
             "Please prioritise donor outreach and drive planning for O- donors. SRC to decide final locations based on donor hotspots and expected donor availability.",
             420, "21 May 2026", "27 May 2026", 1000, 580, 87, 2},
            {"ALT-2605-002", "B+",  Priority.HIGH,     "Sent",
             "B+ Blood Shortage Alert",
             "B+ demand is forecasted to exceed safe supply. Outreach recommended within 24 hours.",
             "Demand is projected to exceed the safe supply threshold for B+ blood over the next 7 days.",
             "Organise 1 donor drive targeting B+ donors.",
             "This will help close the projected shortfall and maintain a safe supply.",
             "Please prioritise donor outreach and drive planning for B+ donors.",
             280, "28 May 2026", "3 Jun 2026", 800, 540, 82, 1},
            {"ALT-2605-003", "A-",  Priority.MEDIUM,   "Sent",
             "A- Blood Shortage Alert",
             "A- supply may fall below safe threshold. Targeted outreach is advised.",
             "Demand is projected to exceed the safe supply threshold for A- blood over the next 7 days.",
             "Organise 1 donor drive targeting A- donors.",
             "This will help close the projected shortfall and maintain a safe supply.",
             "Please prioritise donor outreach and drive planning for A- donors.",
             180, "4 Jun 2026", "10 Jun 2026", 600, 420, 79, 1},
            {"ALT-2605-004", "AB-", Priority.MEDIUM,   "Ready",
             "AB- Blood Shortage Alert",
             "AB- stock projected to dip below safe levels. Plan drives as soon as possible.",
             "Demand is projected to exceed the safe supply threshold for AB- blood over the next 7 days.",
             "Organise 1 donor drive targeting AB- donors.",
             "This will help close the projected shortfall and maintain a safe supply.",
             "Please prioritise donor outreach and drive planning for AB- donors.",
             120, "11 Jun 2026", "17 Jun 2026", 400, 280, 75, 1},
        };

        int seq = 1;
        for (Object[] a : data) {
            Alert alert = new Alert();
            alert.setAlertId((String) a[0]);
            alert.setBloodType((String) a[1]);
            alert.setPriority((Priority) a[2]);
            alert.setAlertStatus((String) a[3]);
            alert.setTitle((String) a[4]);
            alert.setMessage((String) a[5]);
            alert.setReason((String) a[6]);
            alert.setRecommendedAction((String) a[7]);
            alert.setSupportingText((String) a[8]);
            alert.setDefaultNotes((String) a[9]);
            alert.setForecastedShortage((Integer) a[10]);
            alert.setWindowStart((String) a[11]);
            alert.setWindowEnd((String) a[12]);
            alert.setSafeSupplyThreshold((Integer) a[13]);
            alert.setProjectedSupply((Integer) a[14]);
            alert.setForecastConfidence((Integer) a[15]);
            alert.setRecommendedDrives((Integer) a[16]);
            alert.setDismissed(false);
            alert.setDateGenerated(LocalDateTime.now().minusDays(seq++).format(
                java.time.format.DateTimeFormatter.ofPattern("d MMM yyyy, hh:mm a")));
            alertRepository.save(alert);
        }
    }
}
