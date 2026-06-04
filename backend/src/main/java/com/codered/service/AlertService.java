package com.codered.service;

import com.codered.dto.SendAlertRequest;
import com.codered.model.Alert;
import com.codered.model.Hospital;
import com.codered.model.SrcAlert;
import com.codered.model.enums.Priority;
import com.codered.repository.AlertRepository;
import com.codered.repository.HospitalRepository;
import com.codered.repository.SrcAlertRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final HospitalRepository hospitalRepository;
    private final SrcAlertRepository srcAlertRepository;

    public List<Alert> getAlerts(String email) {
        return alertRepository.findByDismissedFalseOrderByCreatedAtDesc();
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAllByOrderByCreatedAtDesc();
    }

    public Alert sendAlert(SendAlertRequest request) {
        Alert alert = new Alert();
        alert.setTitle(request.getTitle() != null ? request.getTitle()
                : (request.getBloodType() != null ? request.getBloodType() + " Blood Shortage" : "Blood Shortage Alert"));
        alert.setMessage(request.getMessage() != null ? request.getMessage() : "");
        alert.setPriority(Priority.valueOf(request.getPriority().toUpperCase()));
        alert.setLocation(request.getLocation());
        alert.setBloodType(request.getBloodType());
        alert.setAlertStatus(request.getAlertStatus() != null ? request.getAlertStatus() : "Sent");
        alert.setForecastedShortage(request.getForecastedShortage());
        alert.setWindowStart(request.getWindowStart());
        alert.setWindowEnd(request.getWindowEnd());
        alert.setSafeSupplyThreshold(request.getSafeSupplyThreshold());
        alert.setProjectedSupply(request.getProjectedSupply());
        alert.setForecastConfidence(request.getForecastConfidence());
        alert.setRecommendedDrives(request.getRecommendedDrives());
        alert.setReason(request.getReason());
        alert.setRecommendedAction(request.getRecommendedAction());
        alert.setSupportingText(request.getSupportingText());
        alert.setDefaultNotes(request.getDefaultNotes());
        alert.setDateGenerated(LocalDateTime.now().format(DateTimeFormatter.ofPattern("d MMM yyyy, hh:mm a")));

        if (request.getHospitalCode() != null && !request.getHospitalCode().isBlank()) {
            Hospital hospital = hospitalRepository.findByCode(request.getHospitalCode())
                    .orElseThrow(() -> new IllegalArgumentException("Hospital not found: " + request.getHospitalCode()));
            alert.setHospital(hospital);
        }

        Alert saved = alertRepository.save(alert);

        String year = String.valueOf(LocalDateTime.now().getYear()).substring(2);
        String month = String.format("%02d", LocalDateTime.now().getMonthValue());
        saved.setAlertId("ALT-" + year + month + "-" + String.format("%03d", saved.getId()));
        saved = alertRepository.save(saved);

        crossCreateSrcAlert(saved, request);
        return saved;
    }

    private void crossCreateSrcAlert(Alert alert, SendAlertRequest request) {
        SrcAlert src = new SrcAlert();
        src.setAlertCode(alert.getAlertId());
        src.setBloodType(request.getBloodType());
        src.setSeverity(alert.getPriority().name());
        src.setForecastedShortage(request.getForecastedShortage() != null ? request.getForecastedShortage() : 0);
        String window = (request.getWindowStart() != null && request.getWindowEnd() != null)
                ? request.getWindowStart() + " – " + request.getWindowEnd() : "TBD";
        src.setShortageWindow(window);
        src.setRecommendedAction(request.getRecommendedAction() != null ? request.getRecommendedAction() : alert.getMessage());
        src.setReceivedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("d MMM yyyy, hh:mm a")));
        src.setStatus("ACTIVE");
        srcAlertRepository.save(src);
    }

    public void dismissAlert(Long id) {
        Alert alert = alertRepository.findById(id).orElseThrow();
        alert.setDismissed(true);
        alertRepository.save(alert);
    }
}
