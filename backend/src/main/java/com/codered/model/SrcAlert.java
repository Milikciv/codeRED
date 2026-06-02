package com.codered.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "src_alerts")
@Data
@NoArgsConstructor
public class SrcAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String alertCode;
    private String bloodType;
    private String severity;
    private Integer forecastedShortage;
    private String shortageWindow;

    @Column(length = 500)
    private String recommendedAction;

    private String receivedAt;
    private String status;
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
