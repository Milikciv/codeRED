package com.codered.config;

import com.codered.model.*;
import com.codered.model.enums.*;
import com.codered.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final HospitalRepository hospitalRepository;
    private final UserRepository userRepository;
    private final BloodStockRepository bloodStockRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final AlertRepository alertRepository;
    private final BloodTransferRepository bloodTransferRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (hospitalRepository.count() > 0) return;
        seedHospitals();
        seedUsers();
        seedBloodStock();
        seedRequests();
        seedAlerts();
        seedTransfers();
    }

    private void seedHospitals() {
        String[][] hospitals = {
            {"SGH", "Singapore General Hospital", "Outram Rd, Singapore 169608"},
            {"NUH", "National University Hospital", "5 Lower Kent Ridge Rd, Singapore 119074"},
            {"KKH", "KK Women's and Children's Hospital", "100 Bukit Timah Rd, Singapore 229899"},
            {"CGH", "Changi General Hospital", "2 Simei Street 3, Singapore 529889"},
            {"NGH", "Ng Teng Fong General Hospital", "1 Jurong East St 21, Singapore 609606"},
            {"TTSH", "Tan Tock Seng Hospital", "11 Jln Tan Tock Seng, Singapore 308433"}
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
        // HSA admin
        User hsa = new User();
        hsa.setEmail("winnie@hsa.gov.sg");
        hsa.setPassword(passwordEncoder.encode("password123"));
        hsa.setName("Winnie Koh");
        hsa.setRole(UserRole.HSA);
        hsa.setDesignation("Blood Services Manager");
        userRepository.save(hsa);

        // Hospital staff
        Hospital sgh = hospitalRepository.findByCode("SGH").orElseThrow();
        User staff = new User();
        staff.setEmail("winnieKoh@SGH.sg");
        staff.setPassword(passwordEncoder.encode("password123"));
        staff.setName("Winnie Koh");
        staff.setRole(UserRole.HOSPITAL_STAFF);
        staff.setDesignation("Head, Emergency Dept");
        staff.setContactNumber("+65 9627 6354");
        staff.setHospital(sgh);
        userRepository.save(staff);

        User james = new User();
        james.setEmail("james.tan@SGH.sg");
        james.setPassword(passwordEncoder.encode("password123"));
        james.setName("Dr. James Tan");
        james.setRole(UserRole.HOSPITAL_STAFF);
        james.setDesignation("Head, Emergency Dept");
        james.setContactNumber("+65 9627 6354");
        james.setHospital(sgh);
        userRepository.save(james);
    }

    private void seedBloodStock() {
        int[][] stockData = {
            // O+, O-, A+, A-, B+, B-, AB+, AB-  (current units)
            {320, 220, 420, 80,  135, 180, 300, 80},   // SGH
            {280, 150, 380, 90,  120, 160, 260, 70},   // NUH
            {200, 100, 300, 60,  90,  120, 200, 50},   // KKH
            {250, 130, 350, 70,  100, 140, 230, 60},   // CGH
            {180, 90,  270, 55,  80,  100, 180, 45},   // NGH
            {210, 110, 310, 65,  95,  130, 210, 55}    // TTSH
        };
        int[][] idealData = {
            {400, 300, 500, 200, 300, 350, 400, 200},  // SGH
            {380, 280, 470, 190, 280, 330, 370, 190},  // NUH
            {300, 220, 380, 150, 220, 260, 290, 150},  // KKH
            {340, 250, 430, 170, 250, 300, 330, 170},  // CGH
            {280, 200, 360, 140, 200, 240, 270, 140},  // NGH
            {310, 230, 400, 160, 230, 280, 310, 160}   // TTSH
        };

        String[] hospitalCodes = {"SGH", "NUH", "KKH", "CGH", "NGH", "TTSH"};
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
        Hospital sgh = hospitalRepository.findByCode("SGH").orElseThrow();
        Hospital kkh = hospitalRepository.findByCode("KKH").orElseThrow();
        Hospital ttsh = hospitalRepository.findByCode("TTSH").orElseThrow();
        Hospital cgh = hospitalRepository.findByCode("CGH").orElseThrow();

        Object[][] requests = {
            {"REQ-2109", sgh, BloodType.O_NEGATIVE, 20, Priority.CRITICAL, RequestStatus.PENDING,
             "Multiple trauma cases due to major road accident.", LocalDateTime.now().minusMinutes(17)},
            {"REQ-2108", kkh, BloodType.A_POSITIVE, 10, Priority.HIGH, RequestStatus.PENDING,
             "Paediatric surgery cases.", LocalDateTime.now().minusMinutes(32)},
            {"REQ-2107", ttsh, BloodType.B_POSITIVE, 10, Priority.MEDIUM, RequestStatus.PENDING,
             "Scheduled surgeries.", LocalDateTime.now().minusMinutes(32)},
            {"REQ-2106", cgh, BloodType.O_NEGATIVE, 10, Priority.MEDIUM, RequestStatus.IN_TRANSIT,
             "Post Surgical Care", LocalDateTime.now().minusMinutes(32)},
        };

        for (Object[] r : requests) {
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

    private void seedTransfers() {
        Hospital sgh = hospitalRepository.findByCode("SGH").orElseThrow();
        Hospital nuh = hospitalRepository.findByCode("NUH").orElseThrow();

        BloodTransfer t1 = new BloodTransfer();
        t1.setTransferId("TRF-2025-3001");
        t1.setDonorHospital(sgh);
        t1.setReceivingHospital(nuh);
        t1.setBloodType(BloodType.O_POSITIVE);
        t1.setUnits(20);
        t1.setPriority(Priority.CRITICAL);
        t1.setStatus("PENDING");
        t1.setPurposeNotes("Urgent Transfer for surgery");
        t1.setRequestedPickupDate(LocalDateTime.now().plusHours(1));
        t1.setEstimatedDelivery(LocalDateTime.now().plusHours(2));
        t1.setCreatedAt(LocalDateTime.now().minusHours(1));
        t1.setUpdatedAt(LocalDateTime.now());
        bloodTransferRepository.save(t1);
    }
}
