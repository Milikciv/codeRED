package com.codered.service;

import com.codered.dto.CollaboratorDto;
import com.codered.model.Collaborator;
import com.codered.model.DonationDrive;
import com.codered.repository.CollaboratorRepository;
import com.codered.repository.DonationDriveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CollaboratorService {

    private final CollaboratorRepository collaboratorRepository;
    private final DonationDriveRepository donationDriveRepository;

    public Map<String, List<CollaboratorDto>> getAllGrouped(String driveCode) {
        Double[] coords = resolveCoords(driveCode);
        return collaboratorRepository.findAll().stream()
            .map(c -> new CollaboratorDto(c, coords[0], coords[1]))
            .collect(Collectors.groupingBy(CollaboratorDto::getCategory));
    }

    public List<CollaboratorDto> getByCategory(String category, String driveCode) {
        Double[] coords = resolveCoords(driveCode);
        return collaboratorRepository.findByCategory(category).stream()
            .map(c -> new CollaboratorDto(c, coords[0], coords[1]))
            .collect(Collectors.toList());
    }

    private Double[] resolveCoords(String driveCode) {
        if (driveCode == null || driveCode.isBlank()) return new Double[]{null, null};
        return donationDriveRepository.findByDriveCode(driveCode)
            .map(d -> new Double[]{d.getLatitude(), d.getLongitude()})
            .orElse(new Double[]{null, null});
    }
}
