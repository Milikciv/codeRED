package com.codered.service;

import com.codered.dto.SendOutreachRequest;
import com.codered.model.DonorOutreach;
import com.codered.model.enums.BloodType;
import com.codered.model.enums.DonorStatus;
import com.codered.repository.DonorOutreachRepository;
import com.codered.repository.DonorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class DonorOutreachService {

    private final DonorRepository donorRepository;
    private final DonorOutreachRepository donorOutreachRepository;

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

        return Map.of(
            "outreachId",      saved.getOutreachId(),
            "type",            saved.getType(),
            "partnerName",     saved.getPartnerName(),
            "partnerCategory", saved.getPartnerCategory(),
            "status",          saved.getStatus(),
            "dateSent",        saved.getDateSent()
        );
    }

    // Generates IDs like "OUT-2506-001"
    private String generateOutreachId(Long id) {
        String year  = String.valueOf(LocalDateTime.now().getYear()).substring(2);
        String month = String.format("%02d", LocalDateTime.now().getMonthValue());
        return "OUT-" + year + month + "-" + String.format("%03d", id);
    }
}
