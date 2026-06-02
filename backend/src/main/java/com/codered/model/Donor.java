package com.codered.model;

import com.codered.model.enums.BloodType;
import com.codered.model.enums.DonorStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "donors")
@Data
@NoArgsConstructor
public class Donor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String donorId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodType bloodType;

    @Column(nullable = false)
    private LocalDate dateOfBirth;

    private String gender;

    // Geographic region name (e.g. "Tampines", "Jurong East")
    private String region;
    private Double latitude;
    private Double longitude;

    // null if never donated
    private LocalDate lastDonationDate;

    private int totalDonations;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DonorStatus status;

    private LocalDate registeredAt;
}
