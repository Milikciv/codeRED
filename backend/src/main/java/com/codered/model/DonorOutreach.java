package com.codered.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Table(name = "donor_outreach")
@Getter
@Setter
public class DonorOutreach {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Auto-generated e.g. "OUT-2506-001"
    private String outreachId;

    // "PUSH_NOTIFICATION" or "INVITATION"
    private String type;

    // For PUSH_NOTIFICATION: blood type filter used
    private String bloodType;

    // For PUSH_NOTIFICATION: region filter used
    private String region;

    // For INVITATION: partner organisation name
    private String partnerName;

    // For INVITATION: "Companies", "Schools", "Community Groups"
    private String partnerCategory;

    // The message/email body that was sent
    @Column(columnDefinition = "TEXT")
    private String message;

    // For INVITATION: email subject line
    private String subject;

    // For PUSH_NOTIFICATION: number of donors targeted
    private Integer donorsReached;

    // For PUSH_NOTIFICATION: whether only active donors were targeted
    private Boolean prevRespondersOnly;

    private String status; // "Sent"

    private String dateSent;
}
