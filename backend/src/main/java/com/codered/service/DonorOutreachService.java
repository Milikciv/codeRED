package com.codered.service;

import com.codered.dto.SendOutreachRequest;
import com.codered.model.Donor;
import com.codered.model.DonationDrive;
import com.codered.model.DonorOutreach;
import com.codered.model.enums.BloodType;
import com.codered.model.enums.DonorStatus;
import com.codered.repository.DonationDriveRepository;
import com.codered.repository.DonorOutreachRepository;
import com.codered.repository.DonorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class DonorOutreachService {

    private final DonorRepository donorRepository;
    private final DonorOutreachRepository donorOutreachRepository;
    private final DonationDriveRepository driveRepository;
    private final AiService aiService;
    private final EmailService emailService;
    private final EmailTemplateService emailTemplateService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String ADMIN_EMAIL = "codered.notify@gmail.com";

    public Map<String, Object> sendPushNotification(SendOutreachRequest request) {

        // 1. Start with all donors then filter down
        Stream<com.codered.model.Donor> donors = donorRepository.findAll().stream();

        // 2. If prevRespondersOnly, target ACTIVE donors only
        if (request.isPrevRespondersOnly()) {
            donors = donors.filter(d -> d.getStatus() == DonorStatus.ACTIVE);
        }

        // 3. Filter by blood type if provided
        if (request.getBloodType() != null && !request.getBloodType().isBlank()) {
            try {
                BloodType bt = BloodType.valueOf(request.getBloodType());
                donors = donors.filter(d -> d.getBloodType() == bt);
            } catch (IllegalArgumentException ignored) {
                // If blood type string doesn't match enum, skip filter
            }
        }

        // 4. Filter by region if provided
        if (request.getRegion() != null && !request.getRegion().isBlank()) {
            donors = donors.filter(d -> request.getRegion().equalsIgnoreCase(d.getRegion()));
        }

        int donorsReached = (int) donors.count();

        // 5. Save the outreach record
        DonorOutreach outreach = new DonorOutreach();
        outreach.setType("PUSH_NOTIFICATION");
        outreach.setBloodType(request.getBloodType());
        outreach.setRegion(request.getRegion());
        outreach.setMessage(request.getMessage());
        outreach.setDonorsReached(donorsReached);
        outreach.setPrevRespondersOnly(request.isPrevRespondersOnly());
        outreach.setStatus("Sent");
        outreach.setDateSent(LocalDateTime.now().format(DateTimeFormatter.ofPattern("d MMM yyyy, hh:mm a")));

        DonorOutreach saved = donorOutreachRepository.save(outreach);
        saved.setOutreachId(generateOutreachId(saved.getId()));
        saved = donorOutreachRepository.save(saved);

        String html = emailTemplateService.buildPushNotificationEmail(
            saved.getMessage(),
            saved.getBloodType(),
            saved.getRegion(),
            saved.getDonorsReached(),
            saved.getOutreachId(),
            saved.getDateSent()
        );
        emailService.sendEmail(ADMIN_EMAIL, "Push Notification Sent — " + saved.getOutreachId(), html, true);

        return Map.of(
            "outreachId",    saved.getOutreachId(),
            "type",          saved.getType(),
            "donorsReached", saved.getDonorsReached(),
            "status",        saved.getStatus(),
            "dateSent",      saved.getDateSent()
        );
    }

    public Map<String, Object> sendInvitation(SendOutreachRequest request) {

        // Save the invitation record
        DonorOutreach outreach = new DonorOutreach();
        outreach.setType("INVITATION");
        outreach.setPartnerName(request.getPartnerName());
        outreach.setPartnerCategory(request.getPartnerCategory());
        outreach.setSubject(request.getSubject());
        outreach.setMessage(request.getMessage());
        outreach.setStatus("Sent");
        outreach.setDateSent(LocalDateTime.now().format(DateTimeFormatter.ofPattern("d MMM yyyy, hh:mm a")));

        DonorOutreach saved = donorOutreachRepository.save(outreach);
        saved.setOutreachId(generateOutreachId(saved.getId()));
        saved = donorOutreachRepository.save(saved);

        if (request.getRecipientEmail() != null && !request.getRecipientEmail().isBlank()) {
            String html = emailTemplateService.buildInvitationEmail(
                saved.getPartnerName(),
                saved.getSubject(),
                saved.getMessage(),
                saved.getOutreachId(),
                saved.getDateSent()
            );
            emailService.sendEmail(request.getRecipientEmail(), saved.getSubject(), html, true);
        }

        return Map.of(
            "outreachId",      saved.getOutreachId(),
            "type",            saved.getType(),
            "partnerName",     saved.getPartnerName(),
            "partnerCategory", saved.getPartnerCategory(),
            "status",          saved.getStatus(),
            "dateSent",        saved.getDateSent()
        );
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getOutreachStrategy(String driveCode, boolean refresh) {
        DonationDrive drive = driveRepository.findByDriveCode(driveCode)
                .orElseThrow(() -> new IllegalArgumentException("Drive not found: " + driveCode));

        // Return cached result if available and not forced to refresh
        if (!refresh && drive.getAiOutreachStrategyJson() != null) {
            try {
                return objectMapper.readValue(drive.getAiOutreachStrategyJson(), Map.class);
            } catch (Exception ignored) { /* fall through to regenerate */ }
        }

        // Parse comma-separated blood types from the drive (e.g. "O-, A-")
        List<String> targetLabels = Arrays.stream(drive.getBloodType().split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());

        LocalDate today = LocalDate.now();
        List<Donor> allActive = donorRepository.findAll().stream()
                .filter(d -> d.getStatus() == DonorStatus.ACTIVE)
                .collect(Collectors.toList());

        // Filter to donors matching the drive's blood type(s)
        List<Donor> targeted = allActive.stream()
                .filter(d -> targetLabels.isEmpty() || targetLabels.contains(d.getBloodType().getLabel()))
                .collect(Collectors.toList());

        // Eligible = hasn't donated in the last 12 weeks (or never donated)
        List<Donor> eligible = targeted.stream()
                .filter(d -> d.getLastDonationDate() == null
                          || d.getLastDonationDate().isBefore(today.minusWeeks(12)))
                .collect(Collectors.toList());

        Map<String, Object> demographics = buildDemographics(targeted, eligible, today);
        Map<String, Object> strategy     = aiService.generateOutreachStrategy(
                drive.getBloodType(), drive.getLocation(), demographics);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("demographics", demographics);
        result.put("strategy",     strategy);

        // Cache result on the drive
        try {
            drive.setAiOutreachStrategyJson(objectMapper.writeValueAsString(result));
            driveRepository.save(drive);
        } catch (Exception ignored) {}

        return result;
    }

    private Map<String, Object> buildDemographics(List<Donor> donors, List<Donor> eligible, LocalDate today) {
        long total = donors.size();

        // By age group
        String[] ageLabels  = {"16-20", "21-30", "31-40", "41-50", "51-60", "60+"};
        int[]    ageMin     = {16, 21, 31, 41, 51, 60};
        int[]    ageMax     = {20, 30, 40, 50, 60, 120};
        List<Map<String, Object>> byAge = new ArrayList<>();
        for (int gi = 0; gi < ageLabels.length; gi++) {
            final int minAge = ageMin[gi], maxAge = ageMax[gi];
            long count = donors.stream().filter(d -> {
                int age = Period.between(d.getDateOfBirth(), today).getYears();
                return age >= minAge && age <= maxAge;
            }).count();
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("group", ageLabels[gi]);
            m.put("count", count);
            m.put("pct",   total > 0 ? Math.round(count * 1000.0 / total) / 10.0 : 0.0);
            byAge.add(m);
        }

        // By gender
        Map<String, Long> genderMap = donors.stream()
                .filter(d -> d.getGender() != null)
                .collect(Collectors.groupingBy(Donor::getGender, Collectors.counting()));
        List<Map<String, Object>> byGender = genderMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("gender", e.getKey());
                    m.put("count",  e.getValue());
                    m.put("pct",    total > 0 ? Math.round(e.getValue() * 1000.0 / total) / 10.0 : 0.0);
                    return m;
                })
                .collect(Collectors.toList());

        // By region (top 5)
        Map<String, Long> regionMap = donors.stream()
                .filter(d -> d.getRegion() != null)
                .collect(Collectors.groupingBy(Donor::getRegion, Collectors.counting()));
        List<Map<String, Object>> byLocation = regionMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("region", e.getKey());
                    m.put("count",  e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        double avgDonations = donors.stream().mapToInt(Donor::getTotalDonations).average().orElse(0.0);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("activeCount",    (long) donors.size());
        result.put("totalEligible",  (long) eligible.size());
        result.put("avgDonations",   Math.round(avgDonations * 10.0) / 10.0);
        result.put("byAge",          byAge);
        result.put("byGender",       byGender);
        result.put("byLocation",     byLocation);
        return result;
    }

    // Generates IDs like "OUT-2506-001"
    private String generateOutreachId(Long id) {
        String year  = String.valueOf(LocalDateTime.now().getYear()).substring(2);
        String month = String.format("%02d", LocalDateTime.now().getMonthValue());
        return "OUT-" + year + month + "-" + String.format("%03d", id);
    }
}
