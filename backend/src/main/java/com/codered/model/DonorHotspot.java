package com.codered.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "donor_hotspots")
@Data
@NoArgsConstructor
public class DonorHotspot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer rank;
    private String name;
    private Integer score;
    private Double latitude;
    private Double longitude;
    private Integer activeDonorCount;
    private String mostActiveAgeGroup;
    private Integer mostActiveAgeGroupPct;

    // For recommended drive alternative locations
    private String venue;
    private Integer eligibleDonors;
    private Integer successRate;
}
