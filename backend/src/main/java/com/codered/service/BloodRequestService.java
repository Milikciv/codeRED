package com.codered.service;

import com.codered.dto.BloodRequestDTO;
import com.codered.model.BloodRequest;
import com.codered.model.RequestBloodItem;
import com.codered.model.User;
import com.codered.model.enums.BloodType;
import com.codered.model.enums.Priority;
import com.codered.model.enums.RequestStatus;
import com.codered.model.enums.UserRole;
import com.codered.repository.BloodRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BloodRequestService {

    private final BloodRequestRepository bloodRequestRepository;

    public List<BloodRequest> getRequests(User user) {

        if (user.getRole() == UserRole.HSA) {
            return bloodRequestRepository.findAllByOrderByRequestedAtDesc();
        }

        return bloodRequestRepository
                .findByRequestingHospitalOrderByRequestedAtDesc(
                        user.getHospital());
    }

    public BloodRequest getRequestById(Long requestId) {

        return bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Request not found: " + requestId));
    }

    public BloodRequest createRequest(
            BloodRequestDTO dto,
            User user) {

        validateRequest(dto);

        BloodRequest request = new BloodRequest();

        request.setRequestId(generateRequestId());

        request.setRequestingHospital(
                user.getHospital());

        request.setRequestedByName(
                user.getName());

        request.setRequestedByDesignation(
                user.getDesignation());

        request.setPriority(
                Priority.valueOf(
                        dto.getPriority().toUpperCase()));

        request.setStatus(
                RequestStatus.PENDING);

        request.setNeededBy(
                dto.getNeededBy());

        request.setRemarks(
                dto.getRemarks());

        populateBloodItems(
                request,
                dto);

        return bloodRequestRepository.save(
                request);
    }

    public BloodRequest updateStatus(
            Long requestId,
            RequestStatus newStatus) {

        BloodRequest request = getRequestById(requestId);

        validateStatusTransition(
                request.getStatus(),
                newStatus);

        request.setStatus(newStatus);

        return bloodRequestRepository.save(
                request);
    }

    public long getActiveCount(User user) {

        if (user.getRole() == UserRole.HSA) {

            return bloodRequestRepository.countByStatus(
                    RequestStatus.PENDING);
        }

        return bloodRequestRepository
                .findByRequestingHospital(
                        user.getHospital())
                .stream()
                .filter(r -> r.getStatus() == RequestStatus.PENDING
                        || r.getStatus() == RequestStatus.APPROVED
                        || r.getStatus() == RequestStatus.PREPARING
                        || r.getStatus() == RequestStatus.IN_TRANSIT)
                .count();
    }

    private void validateRequest(
            BloodRequestDTO dto) {

        if (dto.getPriority() == null) {
            throw new IllegalArgumentException(
                    "Priority is required");
        }

        if ((dto.getItems() == null || dto.getItems().isEmpty())
                && (dto.getBloodTypes() == null
                        || dto.getBloodTypes().isEmpty())) {

            throw new IllegalArgumentException(
                    "At least one blood type must be requested");
        }
    }

    private void populateBloodItems(
            BloodRequest request,
            BloodRequestDTO dto) {

        if (dto.getItems() != null
                && !dto.getItems().isEmpty()) {

            int totalUnits = 0;

            for (BloodRequestDTO.BloodItemDTO item : dto.getItems()) {

                BloodType bloodType = parseBloodType(
                        item.getBloodType());

                RequestBloodItem requestItem = new RequestBloodItem();

                requestItem.setBloodRequest(
                        request);

                requestItem.setBloodType(
                        bloodType);

                requestItem.setUnits(
                        item.getUnits());

                request.getBloodItems()
                        .add(requestItem);

                totalUnits += item.getUnits();

                if (request.getBloodType() == null) {
                    request.setBloodType(
                            bloodType);
                }
            }

            request.setUnitsRequested(
                    totalUnits);
        }

        else {

            BloodType bloodType = parseBloodType(
                    dto.getBloodTypes().get(0));

            request.setBloodType(
                    bloodType);

            request.setUnitsRequested(
                    dto.getUnits());
        }
    }

    private void validateStatusTransition(
            RequestStatus current,
            RequestStatus next) {

        switch (current) {

            case PENDING -> {
                if (next != RequestStatus.APPROVED
                        && next != RequestStatus.REJECTED) {
                    throw new IllegalStateException(
                            "Invalid status transition");
                }
            }

            case APPROVED -> {
                if (next != RequestStatus.PREPARING) {
                    throw new IllegalStateException(
                            "Invalid status transition");
                }
            }

            case PREPARING -> {
                if (next != RequestStatus.IN_TRANSIT) {
                    throw new IllegalStateException(
                            "Invalid status transition");
                }
            }

            case IN_TRANSIT -> {
                if (next != RequestStatus.RECEIVED) {
                    throw new IllegalStateException(
                            "Invalid status transition");
                }
            }

            case RECEIVED -> {
                if (next != RequestStatus.COMPLETED) {
                    throw new IllegalStateException(
                            "Invalid status transition");
                }
            }

            default -> throw new IllegalStateException(
                    "Request is already finalized");
        }
    }

    private String generateRequestId() {

        return "REQ-" +
                UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase();
    }

    private BloodType parseBloodType(
            String raw) {

        return BloodType.valueOf(
                raw.replace("AB+", "AB_POSITIVE")
                        .replace("AB-", "AB_NEGATIVE")
                        .replace("O+", "O_POSITIVE")
                        .replace("O-", "O_NEGATIVE")
                        .replace("A+", "A_POSITIVE")
                        .replace("A-", "A_NEGATIVE")
                        .replace("B+", "B_POSITIVE")
                        .replace("B-", "B_NEGATIVE"));
    }

}
