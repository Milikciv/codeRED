package com.codered.dto;

import com.codered.model.enums.Priority;
import lombok.Data;

@Data
public class AlertRequest {
    private String title;
    private String message;
    private Priority priority;
    private Long hospitalId;
    private String location;
}
