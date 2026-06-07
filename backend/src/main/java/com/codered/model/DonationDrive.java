package com.codered.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "donation_drives")
@Data
@NoArgsConstructor
public class DonationDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String driveCode;
    private String location;
    private String address;
    private String bloodType;
    private Integer expectedDonorsMin;
    private Integer expectedDonorsMax;
    private Integer confirmedDonors;
    private String linkedAlertCode;
    private String date;
    private String startTime;
    private String endTime;
    private String status;           // Planned, Confirmed, Completed
    private Boolean outreachSent;
    private Integer outreachCount;
    private Integer staffAssigned;
    private Boolean venueConfirmed;

    @Column(length = 1000)
    private String notes;

    // Completed drive fields
    private Integer actualTurnout;
    private Integer unitsCollected;
    private Integer conversionRate;

    // Outreach stats (used by DonorOutreach page)
    private Integer hsaShortage;
    private Integer expectedCollection;
    private Integer shortfall;
    private Integer progressPct;
    private Integer outreachConfidence;
    private String outreachLastUpdated;
    private Integer outreachRecipients;
    private Integer expectedResponders;
    private Integer expectedUnits;
    private Integer outreachResponseRate;
    
    // NEW: AI Recommendation Storage
    @Column(columnDefinition = "TEXT")
    private String aiRecommendation;

    // AI-generated donor outreach messages (JSON array of strings)
    @Column(columnDefinition = "TEXT")
    private String aiMessagesJson;

    private LocalDateTime aiMessagesAt;
}