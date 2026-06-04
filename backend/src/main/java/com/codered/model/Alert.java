package com.codered.model;

import com.codered.model.enums.Priority;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
@NoArgsConstructor
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String alertId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hospital_id")
    private Hospital hospital;

    private String location;
    private boolean dismissed;
    private LocalDateTime createdAt;

    // AlertsToSRC display fields
    private String bloodType;
    private String alertStatus;
    private Integer forecastedShortage;
    private String windowStart;
    private String windowEnd;
    private Integer safeSupplyThreshold;
    private Integer projectedSupply;
    private Integer forecastConfidence;
    private Integer recommendedDrives;
    private String dateGenerated;

    @Column(length = 1000)
    private String reason;

    @Column(length = 500)
    private String recommendedAction;

    @Column(length = 500)
    private String supportingText;

    @Column(length = 1000)
    private String defaultNotes;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
