package com.codered.service;

import com.codered.model.DonationDrive;
import com.codered.repository.DonationDriveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DonationDriveService {

    private final DonationDriveRepository driveRepository;

    public List<Map<String, Object>> getDrives() {
        return driveRepository.findAllByOrderByDateAsc().stream()
            .map(this::toMap)
            .collect(Collectors.toList());
    }

    public Map<String, Object> createDrive(Map<String, Object> body) {
        DonationDrive drive = new DonationDrive();
        // Generate a drive code: DR-XXXXXX
        String driveCode = "DR-" + String.format("%06d", (long)(Math.random() * 1_000_000));
        drive.setDriveCode(driveCode);
        drive.setLocation((String) body.getOrDefault("location", ""));
        drive.setAddress((String) body.getOrDefault("address", ""));
        drive.setBloodType((String) body.getOrDefault("bloodType", "O+"));
        drive.setDate((String) body.getOrDefault("date", ""));
        drive.setStartTime((String) body.getOrDefault("startTime", "10:00 AM"));
        drive.setEndTime((String) body.getOrDefault("endTime", "4:00 PM"));
        drive.setStatus("Planned");
        drive.setLinkedAlertCode((String) body.getOrDefault("linkedAlert", null));
        drive.setNotes((String) body.getOrDefault("notes", ""));
        drive.setStaffAssigned(toInt(body.get("staffAssigned"), 0));
        drive.setExpectedDonorsMin(toInt(body.get("expectedMin"), 0));
        drive.setExpectedDonorsMax(toInt(body.get("expectedMax"), 0));
        drive.setConfirmedDonors(0);
        drive.setOutreachSent(false);
        drive.setOutreachCount(0);
        drive.setVenueConfirmed(false);
        return toMap(driveRepository.save(drive));
    }

    public Map<String, Object> updateDrive(String driveCode, Map<String, Object> body) {
        DonationDrive drive = driveRepository.findByDriveCode(driveCode)
            .orElseThrow(() -> new RuntimeException("Drive not found: " + driveCode));
        if (body.containsKey("location"))      drive.setLocation((String) body.get("location"));
        if (body.containsKey("address"))       drive.setAddress((String) body.get("address"));
        if (body.containsKey("bloodType"))     drive.setBloodType((String) body.get("bloodType"));
        if (body.containsKey("date"))          drive.setDate((String) body.get("date"));
        if (body.containsKey("status"))        drive.setStatus((String) body.get("status"));
        if (body.containsKey("notes"))         drive.setNotes((String) body.get("notes"));
        if (body.containsKey("staffAssigned")) drive.setStaffAssigned(toInt(body.get("staffAssigned"), drive.getStaffAssigned()));
        if (body.containsKey("expectedMin"))   drive.setExpectedDonorsMin(toInt(body.get("expectedMin"), drive.getExpectedDonorsMin()));
        if (body.containsKey("expectedMax"))   drive.setExpectedDonorsMax(toInt(body.get("expectedMax"), drive.getExpectedDonorsMax()));
        return toMap(driveRepository.save(drive));
    }

    public void deleteDrive(String driveCode) {
        DonationDrive drive = driveRepository.findByDriveCode(driveCode)
            .orElseThrow(() -> new RuntimeException("Drive not found: " + driveCode));
        driveRepository.delete(drive);
    }

    private static int toInt(Object val, Integer fallback) {
        if (val instanceof Number) return ((Number) val).intValue();
        if (val instanceof String s && !s.isBlank()) {
            try { return Integer.parseInt(s.trim()); } catch (NumberFormatException ignored) {}
        }
        return fallback != null ? fallback : 0;
    }

    private Map<String, Object> toMap(DonationDrive d) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",                   d.getDriveCode());
        m.put("location",             d.getLocation());
        m.put("address",              d.getAddress());
        m.put("bloodType",            d.getBloodType());
        m.put("expectedDonors",       d.getExpectedDonorsMin() + " – " + d.getExpectedDonorsMax());
        m.put("expectedDonorsMin",    d.getExpectedDonorsMin());
        m.put("expectedDonorsMax",    d.getExpectedDonorsMax());
        m.put("confirmedDonors",      d.getConfirmedDonors());
        m.put("linkedAlert",          d.getLinkedAlertCode());
        m.put("date",                 d.getDate());
        m.put("startTime",            d.getStartTime());
        m.put("endTime",              d.getEndTime());
        m.put("time",                 d.getStartTime() + " – " + d.getEndTime());
        m.put("status",               d.getStatus());
        m.put("outreachSent",         d.getOutreachSent());
        m.put("outreachCount",        d.getOutreachCount());
        m.put("staffAssigned",        d.getStaffAssigned());
        m.put("venueConfirmed",       d.getVenueConfirmed());
        m.put("notes",                d.getNotes());
        m.put("actualTurnout",        d.getActualTurnout());
        m.put("unitsCollected",       d.getUnitsCollected());
        m.put("conversionRate",       d.getConversionRate());
        m.put("hsaShortage",          d.getHsaShortage());
        m.put("expectedCollection",   d.getExpectedCollection());
        m.put("shortfall",            d.getShortfall());
        m.put("progressPct",          d.getProgressPct());
        m.put("outreachConfidence",   d.getOutreachConfidence());
        m.put("outreachLastUpdated",  d.getOutreachLastUpdated());
        m.put("outreachRecipients",   d.getOutreachRecipients());
        m.put("expectedResponders",   d.getExpectedResponders());
        m.put("expectedUnits",        d.getExpectedUnits());
        m.put("outreachResponseRate", d.getOutreachResponseRate());
        return m;
    }
}
