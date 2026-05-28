package com.codered.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class BloodRequestDTO {
    private List<String> bloodTypes;
    private Integer units;
    private String priority;
    private LocalDateTime neededBy;
    private String remarks;
}
