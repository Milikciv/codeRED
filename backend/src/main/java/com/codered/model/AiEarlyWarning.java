package com.codered.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_early_warning")
@Data
@NoArgsConstructor
public class AiEarlyWarning {

    // Always a single row with id = 1
    @Id
    private Long id = 1L;

    @Column(columnDefinition = "TEXT")
    private String message;

    private Integer confidence;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    private LocalDateTime generatedAt;
}
