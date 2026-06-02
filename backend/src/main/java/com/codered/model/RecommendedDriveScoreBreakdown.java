package com.codered.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "recommended_drive_score_breakdown")
@Data
@NoArgsConstructor
public class RecommendedDriveScoreBreakdown {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommended_drive_id")
    @JsonIgnore
    private RecommendedDrive recommendedDrive;

    private String criterion;
    private Integer weight;
    private Integer score;
}
