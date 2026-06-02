package com.codered.controller;

import com.codered.model.DonationDrive;
import com.codered.repository.DonationDriveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/drives")
@RequiredArgsConstructor
public class DonationDriveController {

    private final DonationDriveRepository driveRepository;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getDrives() {
        List<Map<String, Object>> result = driveRepository.findAllByOrderByDateAsc().stream()
            .map(this::toMap)
            .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{driveCode}")
    public ResponseEntity<Map<String, Object>> updateDrive(
            @PathVariable String driveCode,
            @RequestBody Map<String, Object> body) {
        DonationDrive drive = driveRepository.findByDriveCode(driveCode)
            .orElseThrow(() -> new RuntimeException("Drive not found: " + driveCode));
        if (body.containsKey("location"))      drive.setLocation((String) body.get("location"));
        if (body.containsKey("address"))       drive.setAddress((String) body.get("address"));
        if (body.containsKey("bloodType"))     drive.setBloodType((String) body.get("bloodType"));
        if (body.containsKey("date"))          drive.setDate((String) body.get("date"));
        if (body.containsKey("status"))        drive.setStatus((String) body.get("status"));
        if (body.containsKey("notes"))         drive.setNotes((String) body.get("notes"));
        if (body.containsKey("staffAssigned")) drive.setStaffAssigned((Integer) body.get("staffAssigned"));
        if (body.containsKey("expectedMin"))   drive.setExpectedDonorsMin((Integer) body.get("expectedMin"));
        if (body.containsKey("expectedMax"))   drive.setExpectedDonorsMax((Integer) body.get("expectedMax"));
        return ResponseEntity.ok(toMap(driveRepository.save(drive)));
    }

    private Map<String, Object> toMap(DonationDrive d) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", d.getDriveCode());
        m.put("location", d.getLocation());
        m.put("address", d.getAddress());
        m.put("bloodType", d.getBloodType());
        m.put("expectedDonors", d.getExpectedDonorsMin() + " – " + d.getExpectedDonorsMax());
        m.put("expectedDonorsMin", d.getExpectedDonorsMin());
        m.put("expectedDonorsMax", d.getExpectedDonorsMax());
        m.put("confirmedDonors", d.getConfirmedDonors());
        m.put("linkedAlert", d.getLinkedAlertCode());
        m.put("date", d.getDate());
        m.put("startTime", d.getStartTime());
        m.put("endTime", d.getEndTime());
        m.put("time", d.getStartTime() + " – " + d.getEndTime());
        m.put("status", d.getStatus());
        m.put("outreachSent", d.getOutreachSent());
        m.put("outreachCount", d.getOutreachCount());
        m.put("staffAssigned", d.getStaffAssigned());
        m.put("venueConfirmed", d.getVenueConfirmed());
        m.put("notes", d.getNotes());
        m.put("actualTurnout", d.getActualTurnout());
        m.put("unitsCollected", d.getUnitsCollected());
        m.put("conversionRate", d.getConversionRate());
        m.put("hsaShortage", d.getHsaShortage());
        m.put("expectedCollection", d.getExpectedCollection());
        m.put("shortfall", d.getShortfall());
        m.put("progressPct", d.getProgressPct());
        m.put("outreachConfidence", d.getOutreachConfidence());
        m.put("outreachLastUpdated", d.getOutreachLastUpdated());
        m.put("outreachRecipients", d.getOutreachRecipients());
        m.put("expectedResponders", d.getExpectedResponders());
        m.put("expectedUnits", d.getExpectedUnits());
        m.put("outreachResponseRate", d.getOutreachResponseRate());
        return m;
    }
}
