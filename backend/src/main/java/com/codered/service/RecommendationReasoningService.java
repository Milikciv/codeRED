package com.codered.service;

import com.codered.model.RecommendedDrive;
import com.codered.model.RecommendedDriveReason;
import com.codered.repository.RecommendedDriveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RecommendationReasoningService {

    private final AiService aiService;
    private final RecommendedDriveRepository recommendedDriveRepository;

    public void generateAndSaveReasoningForDrive(RecommendedDrive drive, String hotspotContext) {
        Map<String, Object> reasoning = aiService.generateRecommendedDriveReasoning(
            drive.getLocation(),
            drive.getBloodType(),
            drive.getEligibleDonors(),
            drive.getHighResponseDonors(),
            drive.getPastSuccessRate(),
            hotspotContext
        );

        if (reasoning == null) {
            System.err.println("Failed to generate reasoning for drive: " + drive.getAlertCode());
            return;
        }

        // Set the narrative impact
        String narrative = (String) reasoning.get("narrative");
        if (narrative != null) {
            drive.setImpact(narrative);
        }

        // Parse and create reason entities
        List<Map<String, String>> reasonsList = (List<Map<String, String>>) reasoning.get("reasons");
        if (reasonsList != null) {
            drive.getReasons().clear();
            for (Map<String, String> reason : reasonsList) {
                RecommendedDriveReason driveReason = new RecommendedDriveReason();
                driveReason.setLabel(reason.get("label"));
                driveReason.setDetail(reason.get("detail"));
                driveReason.setRecommendedDrive(drive);
                drive.getReasons().add(driveReason);
            }
        }

        recommendedDriveRepository.save(drive);
    }
}
