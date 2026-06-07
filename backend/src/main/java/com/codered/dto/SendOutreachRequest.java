package com.codered.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SendOutreachRequest {

    // Set by controller: "PUSH_NOTIFICATION" or "INVITATION"
    private String type;

    // ── PUSH NOTIFICATION fields ──────────────────────────
    // e.g. "A_POS", "O_NEG" — optional donor filter
    private String bloodType;

    // e.g. "Tampines" — optional donor filter
    private String region;

    // If true, only target ACTIVE donors
    private boolean prevRespondersOnly;

    // ── INVITATION fields ─────────────────────────────────
    // Organisation name e.g. "DBS Bank"
    private String partnerName;

    // Recipient email address
    private String recipientEmail;

    // "Companies", "Schools", or "Community Groups"
    private String partnerCategory;

    // Email subject line
    private String subject;

    // ── Shared ────────────────────────────────────────────
    // The message body
    private String message;
}
