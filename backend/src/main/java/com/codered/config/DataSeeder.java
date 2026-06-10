package com.codered.config;

import com.codered.model.*;
import com.codered.model.enums.*;
import com.codered.repository.*;
import com.codered.model.Collaborator;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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
    private final CollaboratorRepository collaboratorRepository;

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
            backfillDriveCoordinates();
            backfillDonorEmails();
            ensureCollaboratorsExist();
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
        if (srcAlertRepository.count() == 0)            seedSrcAlerts();
        if (donationDriveRepository.count() == 0)       seedDonationDrives();
        if (donorRepository.count() == 0)               seedDonors();
        if (donorDemographicRepository.count() == 0)    seedResponseRateTrend();
        seedRecommendedDrive();
        backfillMultiAlertLinks();
        ensureCollaboratorsExist();
    }

    private void seedSrcData() {
        seedDonationDrives();
        seedDonors();
        seedResponseRateTrend();
        seedRecommendedDrive();
        seedCollaborators();
    }

    private void ensureCollaboratorsExist() {
        if (collaboratorRepository.count() == 0) seedCollaborators();
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
        // ── Upcoming drives ──────────────────────────────────────────────────

        // DD-001: single alert (O- only)
        seedDrive("DD-001", "Tampines Community Plaza",
            "Tampines Street 11, Singapore 529455", "O-",
            80, 100, 45, "ALT-2505-001",
            "31 May 2026", "10:00 AM", "4:00 PM", "Planned",
            true, 312, 3, true,
            "Drive targeting O- donors in response to critical shortage alert. Venue booked, awaiting more registrations.",
            null, null, null,
            420, 180, 240, 43, 87, "30 May 2026, 08:15 AM", 86, 18, 180, 21,
            1.3540, 103.9440);

        // DD-002: multi-alert — targets B+ and O+, addresses two active shortages
        seedDrive("DD-002", "Jurong East Sports Centre",
            "21 Jurong East Street 31, Singapore 609517", "B+, O+",
            90, 120, 34, "ALT-2505-002, ALT-2505-004",
            "7 Jun 2026", "9:00 AM", "3:00 PM", "Planned",
            true, 310, 3, true,
            "Combined B+ and O+ drive addressing two active shortage alerts. Outreach sent to donors of both blood types; second wave scheduled for 3 Jun.",
            null, null, null,
            310, 150, 160, 48, 84, "29 May 2026, 02:30 PM", 98, 22, 150, 22,
            1.3329, 103.7436);

        // DD-003: multi-alert — targets A- and O-, addressing both shortage windows
        seedDrive("DD-003", "Woodlands Galaxy CC",
            "31 Woodlands Avenue 6, Singapore 738991", "A-, O-",
            75, 100, 61, "ALT-2505-003, ALT-2505-001",
            "14 Jun 2026", "10:00 AM", "5:00 PM", "Confirmed",
            true, 263, 4, true,
            "Confirmed drive covering both A- and O- shortages. Donor outreach targeted both blood types. Staff briefing on 13 Jun.",
            null, null, null,
            420, 170, 250, 58, 81, "28 May 2026, 11:00 AM", 88, 19, 170, 22,
            1.4372, 103.7864);

        // DD-004: triple-alert — broad community drive covering B+, O+ and A-
        seedDrive("DD-004", "Bedok Community Centre",
            "850 New Upper Changi Rd, Singapore 467352", "B+, O+, A-",
            110, 150, 12, "ALT-2505-002, ALT-2505-004, ALT-2505-003",
            "21 Jun 2026", "9:00 AM", "5:00 PM", "Planned",
            false, 0, 4, true,
            "Large community drive planned to simultaneously address three active shortage alerts — B+, O+ and A-. Outreach to be launched once venue logistics confirmed.",
            null, null, null,
            540, 240, 300, 5, 80, null, 120, 26, 200, 22,
            1.3236, 103.9273);

        // ── History drives (Completed) ───────────────────────────────────────

        // DD-H001: single alert
        seedDrive("DD-H001", "Tampines Hub",
            "Tampines Avenue 4", "O-",
            80, 120, null, "ALT-2505-001",
            "26 Apr 2026", "10:00 AM", "5:00 PM", "Completed",
            true, 0, 3, true, null,
            112, 96, 45,
            null, null, null, null, null, null, null, null, null, null,
            1.3527, 103.9453);

        // DD-H002: multi-alert — B+ and O+ addressed together
        seedDrive("DD-H002", "Jurong East Sports Centre",
            "21 Jurong East Street 31", "B+, O+",
            80, 120, null, "ALT-2505-002, ALT-2505-004",
            "13 Apr 2026", "10:00 AM", "4:00 PM", "Completed",
            true, 0, 3, true, null,
            121, 103, 44,
            null, null, null, null, null, null, null, null, null, null,
            1.3329, 103.7436);

        // DD-H003: multi-alert — A- and O- addressed together
        seedDrive("DD-H003", "Causeway Point Atrium",
            "1 Woodlands Square", "A-, O-",
            70, 90, null, "ALT-2505-003, ALT-2505-001",
            "30 Mar 2026", "10:00 AM", "4:00 PM", "Completed",
            true, 0, 2, true, null,
            84, 69, 39,
            null, null, null, null, null, null, null, null, null, null,
            1.4381, 103.7863);

        // DD-H004: single alert
        seedDrive("DD-H004", "Bedok Community Centre",
            "850 New Upper Changi Rd", "O+",
            70, 90, null, "ALT-2505-004",
            "16 Mar 2026", "10:00 AM", "4:00 PM", "Completed",
            true, 0, 3, true, null,
            85, 71, 40,
            null, null, null, null, null, null, null, null, null, null,
            1.3236, 103.9273);
    }

    /**
     * Idempotent backfill: update existing drives that are still using a single alertCode
     * to their correct multi-alert values so that re-seeded and migrated DBs look the same.
     */
    private void backfillMultiAlertLinks() {
        Map<String, String> updates = Map.of(
            "DD-002",  "ALT-2505-002, ALT-2505-004",
            "DD-003",  "ALT-2505-003, ALT-2505-001",
            "DD-004",  "ALT-2505-002, ALT-2505-004, ALT-2505-003",
            "DD-H002", "ALT-2505-002, ALT-2505-004",
            "DD-H003", "ALT-2505-003, ALT-2505-001"
        );
        donationDriveRepository.findAll().forEach(d -> {
            String target = updates.get(d.getDriveCode());
            if (target != null && !target.equals(d.getLinkedAlertCodes())) {
                d.setLinkedAlertCodes(target);
                // Also widen blood types to match if still single
                if ("DD-002".equals(d.getDriveCode()) && !d.getBloodType().contains(","))
                    d.setBloodType("B+, O+");
                if ("DD-003".equals(d.getDriveCode()) && !d.getBloodType().contains(","))
                    d.setBloodType("A-, O-");
                if ("DD-004".equals(d.getDriveCode()) && !d.getBloodType().contains(","))
                    d.setBloodType("B+, O+, A-");
                if ("DD-H002".equals(d.getDriveCode()) && !d.getBloodType().contains(","))
                    d.setBloodType("B+, O+");
                if ("DD-H003".equals(d.getDriveCode()) && !d.getBloodType().contains(","))
                    d.setBloodType("A-, O-");
                donationDriveRepository.save(d);
            }
        });
        // Seed DD-004 if it doesn't exist yet
        if (donationDriveRepository.findByDriveCode("DD-004").isEmpty()) {
            seedDrive("DD-004", "Bedok Community Centre",
                "850 New Upper Changi Rd, Singapore 467352", "B+, O+, A-",
                110, 150, 12, "ALT-2505-002, ALT-2505-004, ALT-2505-003",
                "21 Jun 2026", "9:00 AM", "5:00 PM", "Planned",
                false, 0, 4, true,
                "Large community drive planned to simultaneously address three active shortage alerts — B+, O+ and A-. Outreach to be launched once venue logistics confirmed.",
                null, null, null,
                540, 240, 300, 5, 80, null, 120, 26, 200, 22,
                1.3236, 103.9273);
        }
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
                           Integer expectedUnits, Integer outreachResponseRate,
                           double lat, double lng) {
        DonationDrive d = new DonationDrive();
        d.setDriveCode(code);
        d.setLocation(location);
        d.setAddress(address);
        d.setBloodType(bloodType);
        d.setExpectedDonorsMin(expMin);
        d.setExpectedDonorsMax(expMax);
        d.setConfirmedDonors(confirmed);
        d.setLinkedAlertCodes(alertCode);
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
        d.setLatitude(lat);
        d.setLongitude(lng);
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
                d.setEmail("donor." + String.format("d%05d", seq - 1).toLowerCase() + "@donors.sg");
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
        record AltEntry(String location, int eligibleDonors, int pastSuccessRate, int confidenceScore, double lat, double lng,
                        String narrative, String[][] reasons, int[][] breakdown) {}
        record DriveEntry(String alertCode, String bloodType, String date, String startTime, String endTime,
                          int eligibleDonors, int highResponseDonors, int pastSuccessRate, int confidenceScore,
                          String location, double lat, double lng,
                          String narrative, String[][] reasons, int[][] breakdown,
                          AltEntry[] alternatives) {}

        String[] breakdownCriteria = {"Eligible donor density","Low recent donation activity","Accessibility","Nearby amenities","Past drive success"};

        List<DriveEntry> entries = List.of(
            new DriveEntry("ALT-2505-001", "O-", "Sat, 31 May 2026", "10:00 AM", "4:00 PM", 86, 18, 72, 87,
                "Tampines Community Plaza", 1.3540, 103.9440,
                "Tampines Community Plaza is an ideal venue due to its high-density residential catchment and strong community spirit. With 86 eligible donors within 5km and a 72% past success rate, this location consistently delivers strong drive outcomes.",
                new String[][]{
                    {"High donor density","Over 86 eligible donors live within 5km, giving this drive a large pool to draw from."},
                    {"Strong community engagement","Tampines has historically shown high participation in community health events."},
                    {"Good MRT connectivity","Located near Tampines MRT, making it easily accessible for donors island-wide."},
                    {"High past success rate","72% of past drives here met or exceeded their donation targets."},
                },
                new int[][]{{30,28},{25,22},{20,17},{15,10},{10,9}},
                new AltEntry[]{
                    new AltEntry("Woodlands Civic Centre", 74, 65, 78, 1.4382, 103.7891,
                        "Woodlands Civic Centre is a well-known community landmark with strong foot traffic. Its 74 eligible donors and 65% past success rate make it a solid alternative for an O- drive in the north.",
                        new String[][]{
                            {"Strong foot traffic","The civic centre sees high daily foot traffic from residents and commuters."},
                            {"North-region coverage","Covers Woodlands and surrounding estates with a large eligible donor base."},
                            {"Community familiarity","Regular community events at the venue improve donor awareness and participation."},
                            {"MRT accessibility","Served by Woodlands MRT on the North-South Line."},
                        },
                        new int[][]{{30,26},{25,20},{20,16},{15,9},{10,7}}),
                    new AltEntry("Jurong East CC", 68, 60, 72, 1.3330, 103.7430,
                        "Jurong East CC is a high-traffic hub in the west with strong transport links and a reliable donor base. Its 68 eligible donors and 60% past success rate make it a dependable fallback for O- drives.",
                        new String[][]{
                            {"Major transport hub","Jurong East interchange connects multiple MRT lines and numerous bus routes."},
                            {"West-region donor reach","Covers Jurong East and nearby estates, tapping a sizeable O- eligible pool."},
                            {"Established venue","CC has hosted multiple past drives with adequate facilities and parking."},
                            {"Good past success","60% past success rate reflects a consistent local donor response."},
                        },
                        new int[][]{{30,23},{25,19},{20,15},{15,9},{10,6}}),
                    new AltEntry("Bishan CC", 55, 58, 65, 1.3510, 103.8480,
                        "Bishan CC sits in a central location with good island-wide accessibility. While its eligible donor pool is smaller at 55, its central position maximises reach across multiple neighbourhoods.",
                        new String[][]{
                            {"Central island location","Bishan's central position makes it accessible from north, east, and west regions."},
                            {"Multi-line MRT access","Served by both the North-South and Circle Lines at Bishan MRT."},
                            {"Active CC programmes","Regular health and community events keep residents familiar with donation drives."},
                            {"Moderate donor base","55 eligible donors provides a workable target pool for O- outreach."},
                        },
                        new int[][]{{30,19},{25,17},{20,14},{15,8},{10,7}}),
                }),

            new DriveEntry("ALT-2505-002", "B+", "Fri, 7 Jun 2026", "9:00 AM", "3:00 PM", 75, 22, 68, 82,
                "Jurong East Sports Centre", 1.3329, 103.7436,
                "Jurong East Sports Centre offers central accessibility and a large venue capacity suited for high-volume drives. Its 22 high-response donors and 68% past success rate reflect a reliable and motivated local donor base.",
                new String[][]{
                    {"Central location","Jurong East is a major transport hub, accessible from multiple MRT lines and bus routes."},
                    {"Large venue capacity","The sports centre can accommodate high donor volumes with minimal wait times."},
                    {"High-response donor base","22 high-response donors in the area are likely to turn up reliably."},
                    {"Consistent past performance","68% past success rate indicates a reliable and motivated local donor community."},
                },
                new int[][]{{30,25},{25,20},{20,18},{15,11},{10,8}},
                new AltEntry[]{
                    new AltEntry("Tampines Hub", 62, 63, 74, 1.3527, 103.9453,
                        "Tampines Hub is a flagship community facility with high daily visitorship. Its 62 eligible donors and 63% past success rate make it a strong east-region alternative for B+ drives.",
                        new String[][]{
                            {"High visitorship","Tampines Hub integrates a library, sports centre, and hawker centre, drawing large crowds."},
                            {"East-region coverage","Covers Tampines and Pasir Ris with a healthy B+ eligible donor pool."},
                            {"Good past performance","63% past success rate reflects reliable turnout from east-region donors."},
                            {"Strong transport links","Well-connected via Tampines MRT and major bus routes."},
                        },
                        new int[][]{{30,24},{25,20},{20,15},{15,9},{10,6}}),
                    new AltEntry("Yishun CC", 58, 60, 70, 1.4295, 103.8353,
                        "Yishun CC serves one of Singapore's most populous towns with strong community outreach. Its 58 eligible donors and 60% past success rate reflect consistent north-region donor engagement.",
                        new String[][]{
                            {"Large residential catchment","Yishun is one of Singapore's largest towns with a high donor-eligible population."},
                            {"North-region access","Covers Yishun and nearby Sembawang, expanding outreach coverage."},
                            {"Active CC network","Yishun CC regularly organises community events, improving drive visibility."},
                            {"MRT and bus access","Served by Yishun MRT and multiple feeder bus routes."},
                        },
                        new int[][]{{30,22},{25,19},{20,15},{15,8},{10,6}}),
                    new AltEntry("Toa Payoh Hub", 50, 55, 63, 1.3318, 103.8470,
                        "Toa Payoh Hub is a well-known central-region landmark with steady community participation. Its 50 eligible donors and central location make it a viable option for broadening B+ drive coverage.",
                        new String[][]{
                            {"Central location","Toa Payoh Hub is easily accessible from multiple parts of Singapore."},
                            {"Established community venue","A long-standing community destination with strong resident familiarity."},
                            {"MRT proximity","Located near Toa Payoh MRT on the North-South Line."},
                            {"Reliable past participation","55% past success rate indicates consistent donor engagement in the area."},
                        },
                        new int[][]{{30,20},{25,16},{20,14},{15,8},{10,5}}),
                }),

            new DriveEntry("ALT-2505-003", "A-", "Sat, 14 Jun 2026", "10:00 AM", "5:00 PM", 68, 15, 75, 79,
                "Woodlands Galaxy CC", 1.4372, 103.7864,
                "Woodlands Galaxy CC benefits from strong MRT and bus connectivity and a highly engaged community. With 68 eligible donors and a 75% past success rate, this location has a proven track record for successful drives.",
                new String[][]{
                    {"Proven track record","75% past success rate is among the highest across all recommended locations."},
                    {"Strong local engagement","Woodlands CC runs active community programmes that drive foot traffic and awareness."},
                    {"Excellent public transport access","Well-served by Woodlands MRT and multiple bus routes for easy donor access."},
                    {"Eligible donor pool","68 eligible donors within 5km ensures sufficient reach for the A- blood type target."},
                },
                new int[][]{{30,22},{25,21},{20,16},{15,10},{10,9}},
                new AltEntry[]{
                    new AltEntry("Bedok Community Centre", 60, 68, 73, 1.3236, 103.9273,
                        "Bedok Community Centre has one of the highest past success rates among alternative locations at 68%. Its 60 eligible donors and east-region positioning make it a strong option for A- drives.",
                        new String[][]{
                            {"High past success rate","68% past success rate is the highest among this drive's alternatives."},
                            {"East-region donor coverage","Covers Bedok and surrounding estates with a solid A- eligible pool."},
                            {"Community drive experience","Bedok CC has hosted multiple drives with experienced logistics and setup."},
                            {"Transport accessibility","Served by Bedok MRT and a major bus interchange."},
                        },
                        new int[][]{{30,23},{25,20},{20,15},{15,9},{10,6}}),
                    new AltEntry("Clementi CC", 55, 62, 68, 1.3154, 103.7649,
                        "Clementi CC benefits from a dense residential catchment and proximity to NUS, expanding the potential donor demographic. Its 55 eligible donors and 62% success rate reflect steady west-region engagement.",
                        new String[][]{
                            {"University-adjacent location","Proximity to NUS broadens the eligible donor demographic to include younger adults."},
                            {"Dense residential area","Clementi's high-density housing ensures a sizeable local donor pool."},
                            {"Good past performance","62% past success rate reflects reliable donor participation in the west."},
                            {"MRT access","Served by Clementi MRT on the East-West Line."},
                        },
                        new int[][]{{30,21},{25,18},{20,15},{15,8},{10,6}}),
                    new AltEntry("Ang Mo Kio CC", 48, 58, 61, 1.3691, 103.8454,
                        "Ang Mo Kio CC sits in a mature estate with an active senior community and strong civic participation. Its central-north position provides coverage for donors not reachable by Woodlands-based drives.",
                        new String[][]{
                            {"Mature estate engagement","AMK residents have strong familiarity with community health programmes."},
                            {"Central-north coverage","Offers complementary geographic reach to supplement north-region drives."},
                            {"Active civic participation","Regular CC events build awareness and drive footfall for donation campaigns."},
                            {"MRT and bus access","Served by Ang Mo Kio MRT and extensive feeder bus routes."},
                        },
                        new int[][]{{30,18},{25,16},{20,14},{15,8},{10,5}}),
                }),

            new DriveEntry("ALT-2505-004", "O+", "Sun, 22 Jun 2026", "10:00 AM", "4:00 PM", 92, 25, 70, 85,
                "Bedok Community Centre", 1.3236, 103.9273,
                "Bedok Community Centre draws from one of Singapore's largest residential catchments with 92 eligible donors nearby. Its 25 high-response donors and strong public transport links make it a top-performing drive location.",
                new String[][]{
                    {"Largest donor catchment","92 eligible donors nearby — the highest of all recommended locations."},
                    {"Top high-response donors","25 high-response donors make Bedok the strongest location for reliable turnout."},
                    {"Strong past drive performance","Previous drives at Bedok CC consistently attracted strong donor numbers."},
                    {"Excellent accessibility","Served by Bedok MRT and major bus interchanges, convenient for the wider east region."},
                },
                new int[][]{{30,29},{25,23},{20,17},{15,10},{10,9}},
                new AltEntry[]{
                    new AltEntry("Jurong West CC", 80, 67, 79, 1.3479, 103.7069,
                        "Jurong West CC draws from one of Singapore's largest western residential estates with 80 eligible donors nearby. Its 67% past success rate and strong community infrastructure make it a top alternative for O+ drives.",
                        new String[][]{
                            {"Large western donor pool","80 eligible donors in the vicinity — the highest among this drive's alternatives."},
                            {"Strong past success rate","67% past success rate reflects consistently high turnout at this venue."},
                            {"Large estate coverage","Jurong West is one of Singapore's most populous towns, maximising outreach potential."},
                            {"Good transport connectivity","Accessible via Boon Lay MRT and multiple major bus routes."},
                        },
                        new int[][]{{30,27},{25,21},{20,16},{15,9},{10,6}}),
                    new AltEntry("Sembawang CC", 72, 63, 74, 1.4491, 103.8185,
                        "Sembawang CC is well-positioned in the north with 72 eligible donors and a 63% past success rate. Its strong community ties and proximity to naval and military estates broaden the donor demographic.",
                        new String[][]{
                            {"North-region coverage","Covers Sembawang and Canberra estates, reaching donors not served by east-region drives."},
                            {"Diverse donor demographic","Proximity to HDB estates and military housing expands the eligible donor profile."},
                            {"Active CC engagement","Sembawang CC runs regular health outreach programmes that support drive visibility."},
                            {"Bus and MRT access","Served by Sembawang MRT and feeder bus routes."},
                        },
                        new int[][]{{30,24},{25,20},{20,16},{15,9},{10,5}}),
                    new AltEntry("Queenstown CC", 65, 60, 68, 1.2944, 103.8060,
                        "Queenstown CC offers central-south coverage with good MRT connectivity and a steady community donor base. Its 65 eligible donors and 60% past success rate make it a reliable south-west option for O+ drives.",
                        new String[][]{
                            {"Central-south positioning","Provides geographic coverage in the south, complementing east and north drives."},
                            {"MRT accessibility","Close to Queenstown MRT on the East-West Line for easy donor access."},
                            {"Mature estate participation","Queenstown is one of Singapore's oldest towns with strong community health awareness."},
                            {"Steady donor engagement","60% past success rate reflects consistent outreach outcomes in this area."},
                        },
                        new int[][]{{30,22},{25,18},{20,15},{15,8},{10,5}}),
                })
        );

        for (DriveEntry e : entries) {
            // Rank-1: seed only if reasons are missing
            Optional<RecommendedDrive> existingTop = recommendedDriveRepository.findByAlertCodeAndRank(e.alertCode(), 1);
            if (existingTop.isEmpty() || existingTop.get().getReasons().isEmpty()) {
                RecommendedDrive rd = existingTop.orElse(new RecommendedDrive());
                rd.setAlertCode(e.alertCode()); rd.setRank(1);
                rd.setLocation(e.location());   rd.setBloodType(e.bloodType());
                rd.setDate(e.date());           rd.setStartTime(e.startTime()); rd.setEndTime(e.endTime());
                rd.setEligibleDonors(e.eligibleDonors()); rd.setHighResponseDonors(e.highResponseDonors());
                rd.setPastSuccessRate(e.pastSuccessRate()); rd.setConfidenceScore(e.confidenceScore());
                rd.setLatitude(e.lat()); rd.setLongitude(e.lng());

                rd.getReasons().clear();
                RecommendedDriveReason narrativeReason = new RecommendedDriveReason();
                narrativeReason.setLabel("Narrative"); narrativeReason.setDetail(e.narrative());
                narrativeReason.setRecommendedDrive(rd);
                rd.getReasons().add(narrativeReason);
                for (String[] r : e.reasons()) {
                    RecommendedDriveReason reason = new RecommendedDriveReason();
                    reason.setLabel(r[0]); reason.setDetail(r[1]);
                    reason.setRecommendedDrive(rd);
                    rd.getReasons().add(reason);
                }
                rd.getScoreBreakdown().clear();
                int[][] bd = e.breakdown();
                for (int i = 0; i < bd.length; i++) {
                    RecommendedDriveScoreBreakdown s = new RecommendedDriveScoreBreakdown();
                    s.setRecommendedDrive(rd); s.setCriterion(breakdownCriteria[i]);
                    s.setWeight(bd[i][0]);     s.setScore(bd[i][1]);
                    rd.getScoreBreakdown().add(s);
                }
                recommendedDriveRepository.save(rd);
            }

            // Rank 2+: seed alternative if missing or reasons not yet populated
            int rank = 2;
            for (AltEntry alt : e.alternatives()) {
                int altRank = rank++;
                Optional<RecommendedDrive> existingAlt = recommendedDriveRepository.findByAlertCodeAndRank(e.alertCode(), altRank);
                if (existingAlt.isPresent() && !existingAlt.get().getReasons().isEmpty()) continue;

                RecommendedDrive altDrive = existingAlt.orElse(new RecommendedDrive());
                altDrive.setAlertCode(e.alertCode()); altDrive.setRank(altRank);
                altDrive.setLocation(alt.location());  altDrive.setBloodType(e.bloodType());
                altDrive.setDate(e.date());            altDrive.setStartTime(e.startTime()); altDrive.setEndTime(e.endTime());
                altDrive.setEligibleDonors(alt.eligibleDonors());
                altDrive.setPastSuccessRate(alt.pastSuccessRate());
                altDrive.setConfidenceScore(alt.confidenceScore());
                altDrive.setLatitude(alt.lat()); altDrive.setLongitude(alt.lng());

                altDrive.getReasons().clear();
                RecommendedDriveReason altNarrative = new RecommendedDriveReason();
                altNarrative.setLabel("Narrative"); altNarrative.setDetail(alt.narrative());
                altNarrative.setRecommendedDrive(altDrive);
                altDrive.getReasons().add(altNarrative);
                for (String[] r : alt.reasons()) {
                    RecommendedDriveReason reason = new RecommendedDriveReason();
                    reason.setLabel(r[0]); reason.setDetail(r[1]);
                    reason.setRecommendedDrive(altDrive);
                    altDrive.getReasons().add(reason);
                }
                altDrive.getScoreBreakdown().clear();
                for (int i = 0; i < alt.breakdown().length; i++) {
                    RecommendedDriveScoreBreakdown s = new RecommendedDriveScoreBreakdown();
                    s.setRecommendedDrive(altDrive); s.setCriterion(breakdownCriteria[i]);
                    s.setWeight(alt.breakdown()[i][0]); s.setScore(alt.breakdown()[i][1]);
                    altDrive.getScoreBreakdown().add(s);
                }
                recommendedDriveRepository.save(altDrive);
            }
        }
    }

    // ── drive coordinate backfill ────────────────────────────────────────

    private void backfillDriveCoordinates() {
        Map<String, double[]> coords = Map.of(
            "DD-001",  new double[]{1.3540, 103.9440},
            "DD-002",  new double[]{1.3329, 103.7436},
            "DD-003",  new double[]{1.4372, 103.7864},
            "DD-004",  new double[]{1.3236, 103.9273},
            "DD-H001", new double[]{1.3527, 103.9453},
            "DD-H002", new double[]{1.3329, 103.7436},
            "DD-H003", new double[]{1.4381, 103.7863},
            "DD-H004", new double[]{1.3236, 103.9273}
        );
        donationDriveRepository.findAll().forEach(d -> {
            if (d.getLatitude() == null && coords.containsKey(d.getDriveCode())) {
                double[] c = coords.get(d.getDriveCode());
                d.setLatitude(c[0]);
                d.setLongitude(c[1]);
                donationDriveRepository.save(d);
            }
        });
    }

    // ── donor email backfill ─────────────────────────────────────────────

    private void backfillDonorEmails() {
        donorRepository.findAll().forEach(d -> {
            if (d.getEmail() == null || d.getEmail().isBlank()) {
                d.setEmail("donor." + d.getDonorId().toLowerCase().replace("-", "") + "@donors.sg");
                donorRepository.save(d);
            }
        });
    }

    // ── collaborators ─────────────────────────────────────────────────────

    private void seedCollaborators() {
        // { name, email, address, lat, lng, reach, score, category, tags }
        Object[][] data = {
            {"DBS Bank",              "csr@dbs.com",                   "Tampines Central 1",                1.3547, 103.9442, "4,500 employees", 82, "Companies",        new String[]{"Large Company", "Health Partner"}},
            {"Singapore Airlines",    "community@singaporeair.com",    "Airline House, 25 Airline Rd",      1.3357, 103.8594, "3,200 employees", 76, "Companies",        new String[]{"Large Company", "Health Partner"}},
            {"CapitaLand",            "csr@capitaland.com",            "168 Robinson Rd",                   1.2791, 103.8490, "2,800 employees", 61, "Companies",        new String[]{"Large Company", "Community Partner"}},
            {"ST Engineering",        "community@stengg.com",          "1 Ang Mo Kio Electronics Park",     1.3695, 103.8591, "2,100 employees", 70, "Companies",        new String[]{"Large Company"}},
            {"Temasek Polytechnic",   "studentaffairs@tp.edu.sg",      "21 Tampines Ave 1",                 1.3456, 103.9311, "2,000 students",  92, "Schools",          new String[]{"Polytechnic", "Youth Partner"}},
            {"SUTD",                  "studentlife@sutd.edu.sg",       "8 Somapah Rd",                      1.3414, 103.9635, "1,800 students",  85, "Schools",          new String[]{"University", "Research Partner"}},
            {"ITE College East",      "studentservices@ite.edu.sg",    "10 Simei Ave",                      1.3428, 103.9424, "1,500 students",  78, "Schools",          new String[]{"ITE", "Youth Partner"}},
            {"Temasek JC",            "general@temasekjc.moe.edu.sg", "22 Bedok South Rd",                 1.3254, 103.9324, "1,200 students",  81, "Schools",          new String[]{"Junior College", "Youth Partner"}},
            {"Community Clubs",       "pa_tampines@pa.gov.sg",         "Tampines Town Council",             1.3521, 103.9406, "3,000 members",   90, "Community Groups", new String[]{"Community", "Grassroots"}},
            {"Religious Organisations","outreach@ircc.sg",             "Various Locations",                 1.3530, 103.9420, "1,500 members",   86, "Community Groups", new String[]{"Faith-based", "Community"}},
            {"Grassroots Organisations","tampines@grassroots.gov.sg",  "Tampines GRC",                      1.3510, 103.9380, "2,200 members",   88, "Community Groups", new String[]{"Grassroots", "Community"}},
        };

        for (Object[] row : data) {
            if (collaboratorRepository.existsByName((String) row[0])) continue;
            Collaborator c = new Collaborator();
            c.setName((String) row[0]);
            c.setEmail((String) row[1]);
            c.setAddress((String) row[2]);
            c.setLatitude((double) row[3]);
            c.setLongitude((double) row[4]);
            c.setReach((String) row[5]);
            c.setScore((int) row[6]);
            c.setCategory((String) row[7]);
            c.setTags(List.of((String[]) row[8]));
            collaboratorRepository.save(c);
        }
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
            if (hospitalRepository.findByCode(h[0]).isPresent()) continue;
            Hospital hospital = new Hospital();
            hospital.setCode(h[0]);
            hospital.setName(h[1]);
            hospital.setAddress(h[2]);
            hospitalRepository.save(hospital);
        }
    }

    private void seedUsers() {
        if (userRepository.findByEmail("winnie@hsa.gov.sg").isEmpty()) {
            User hsa = new User();
            hsa.setEmail("winnie@hsa.gov.sg");
            hsa.setPassword(passwordEncoder.encode("password123"));
            hsa.setName("Winnie Koh");
            hsa.setRole(UserRole.HSA);
            hsa.setDesignation("Blood Services Manager");
            userRepository.save(hsa);
        }

        if (userRepository.findByEmail("winnie@redcross.org.sg").isEmpty()) {
            User src = new User();
            src.setEmail("winnie@redcross.org.sg");
            src.setPassword(passwordEncoder.encode("password123"));
            src.setName("Winnie Koh");
            src.setRole(UserRole.SRC_STAFF);
            src.setDesignation("SRC Staff");
            userRepository.save(src);
        }
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
