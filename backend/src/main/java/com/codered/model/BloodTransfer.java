package com.codered.model;

import com.codered.model.enums.BloodType;
import com.codered.model.enums.Priority;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "blood_transfers")
@Data
@NoArgsConstructor
public class BloodTransfer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String transferId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "donor_hospital_id", nullable = false)
    private Hospital donorHospital;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiving_hospital_id", nullable = false)
    private Hospital receivingHospital;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "blood_request_id")
    private BloodRequest bloodRequest;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodType bloodType;

    @Column(nullable = false)
    private Integer units;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    private String status;
    private String purposeNotes;
    private LocalDateTime requestedPickupDate;
    private LocalDateTime estimatedDelivery;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
