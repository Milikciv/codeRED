package com.codered.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "donor_demographics")
@Data
@NoArgsConstructor
public class DonorDemographic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // category: summary | blood_type | age | location | response_rate
    private String category;

    // label: stat name / blood type / age group / location / month
    private String label;

    private Long count;
    private Double percentage;
    private Integer rank;
    private Double latitude;
    private Double longitude;
    private Double rate;
    private Integer sortOrder;
}
