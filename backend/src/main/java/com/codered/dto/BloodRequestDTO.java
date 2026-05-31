package com.codered.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class BloodRequestDTO {
    private List<String> bloodTypes;   // kept for backward compat
    private Integer units;             // kept for backward compat
    private List<BloodItemDTO> items;  // per-type breakdown: [{ bloodType: "O+", units: 20 }, ...]
    private String priority;
    private LocalDateTime neededBy;
    private String remarks;

    @Data
    public static class BloodItemDTO {
        private String bloodType;
        private Integer units;
    }
}
