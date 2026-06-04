package com.codered.dto;

import lombok.Data;

@Data
public class SendAlertRequest {
    private String title;
    private String message;
    private String priority;
    private String hospitalCode;
    private String location;
    private String bloodType;
    private String alertStatus;
    private Integer forecastedShortage;
    private String windowStart;
    private String windowEnd;
    private Integer safeSupplyThreshold;
    private Integer projectedSupply;
    private Integer forecastConfidence;
    private Integer recommendedDrives;
    private String reason;
    private String recommendedAction;
    private String supportingText;
    private String defaultNotes;
}
