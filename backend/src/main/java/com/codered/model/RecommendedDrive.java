package com.codered.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "recommended_drives")
@Data
@NoArgsConstructor
public class RecommendedDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String alertCode;
    private String location;
    private String bloodType;
    private String date;
    private String startTime;
    private String endTime;
    private Integer eligibleDonors;
    private Integer highResponseDonors;
    private Integer pastSuccessRate;
    private Integer confidenceScore;
    private Integer rank;
    private Double latitude;
    private Double longitude;

    @OneToMany(mappedBy = "recommendedDrive", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<RecommendedDriveReason> reasons = new ArrayList<>();

    @OneToMany(mappedBy = "recommendedDrive", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<RecommendedDriveScoreBreakdown> scoreBreakdown = new ArrayList<>();
}
