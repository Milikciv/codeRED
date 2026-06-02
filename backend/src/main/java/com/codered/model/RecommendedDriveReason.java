package com.codered.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "recommended_drive_reasons")
@Data
@NoArgsConstructor
public class RecommendedDriveReason {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recommended_drive_id")
    @JsonIgnore
    private RecommendedDrive recommendedDrive;

    private String label;

    @Column(length = 500)
    private String detail;
}
