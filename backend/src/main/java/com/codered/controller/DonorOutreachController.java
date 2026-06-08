package com.codered.controller;

import com.codered.dto.SendOutreachRequest;
import com.codered.service.DonorOutreachService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/donor-outreach")
@RequiredArgsConstructor
public class DonorOutreachController {

    private final DonorOutreachService donorOutreachService;

    // POST /api/donor-outreach/push-notification
    // Body: { message, bloodType, region, prevRespondersOnly }
    @PostMapping("/push-notification")
    public ResponseEntity<Map<String, Object>> sendPushNotification(
            @RequestBody SendOutreachRequest request) {
        return ResponseEntity.ok(donorOutreachService.sendPushNotification(request));
    }

    // POST /api/donor-outreach/invitation
    // Body: { partnerName, partnerCategory, subject, message }
    @PostMapping("/invitation")
    public ResponseEntity<Map<String, Object>> sendInvitation(
            @RequestBody SendOutreachRequest request) {
        return ResponseEntity.ok(donorOutreachService.sendInvitation(request));
    }

    // GET /api/donor-outreach/strategy?driveCode=DR-XXXXXX[&refresh=true]
    // Returns drive-specific donor demographics + AI outreach strategy recommendation
    @GetMapping("/strategy")
    public ResponseEntity<Map<String, Object>> getOutreachStrategy(
            @RequestParam String driveCode,
            @RequestParam(defaultValue = "false") boolean refresh) {
        return ResponseEntity.ok(donorOutreachService.getOutreachStrategy(driveCode, refresh));
    }
}
