package com.codered.model;

import com.codered.model.enums.BloodType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "blood_stock_history")
@Data
@NoArgsConstructor
public class BloodStockHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hospital_id", nullable = false)
    private Hospital hospital;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BloodType bloodType;

    @Column(nullable = false)
    private Integer currentUnits;

    @Column(nullable = false)
    private Integer idealUnits;

    @Column(nullable = false)
    private LocalDate snapshotDate;
}