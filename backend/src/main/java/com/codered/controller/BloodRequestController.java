package com.codered.controller;

import com.codered.dto.BloodRequestDTO;
import com.codered.model.BloodRequest;
import com.codered.model.RequestBloodItem;
import com.codered.model.User;
import com.codered.model.enums.BloodType;
import com.codered.model.enums.Priority;
import com.codered.model.enums.RequestStatus;
import com.codered.model.enums.UserRole;
import com.codered.repository.BloodRequestRepository;
import com.codered.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class BloodRequestController {

    private final BloodRequestRepository bloodRequestRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<BloodRequest>> getRequests(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        if (user.getRole() == UserRole.HSA) {
            return ResponseEntity.ok(bloodRequestRepository.findAllByOrderByRequestedAtDesc());
        } else {
            return ResponseEntity.ok(bloodRequestRepository.findByRequestingHospitalOrderByRequestedAtDesc(user.getHospital()));
        }
    }

    @PostMapping
    public ResponseEntity<BloodRequest> createRequest(
            @RequestBody BloodRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        BloodRequest request = new BloodRequest();
        request.setRequestId("REQ-" + System.currentTimeMillis() % 10000);
        request.setRequestingHospital(user.getHospital());
        request.setPriority(Priority.valueOf(dto.getPriority().toUpperCase()));
        request.setStatus(RequestStatus.PENDING);
        request.setRemarks(dto.getRemarks());
        request.setNeededBy(dto.getNeededBy());
        request.setRequestedByName(user.getName());
        request.setRequestedByDesignation(user.getDesignation());

        // Persist per-type blood items
        if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            int total = 0;
            for (BloodRequestDTO.BloodItemDTO item : dto.getItems()) {
                BloodType bt = parseBloodType(item.getBloodType());
                RequestBloodItem rbi = new RequestBloodItem();
                rbi.setBloodRequest(request);
                rbi.setBloodType(bt);
                rbi.setUnits(item.getUnits());
                request.getBloodItems().add(rbi);
                total += item.getUnits();
                if (request.getBloodType() == null) request.setBloodType(bt); // primary type for workbench
            }
            request.setUnitsRequested(total);
        } else if (dto.getBloodTypes() != null && !dto.getBloodTypes().isEmpty()) {
            // fallback: legacy single-type payload
            request.setBloodType(parseBloodType(dto.getBloodTypes().get(0)));
            request.setUnitsRequested(dto.getUnits() != null ? dto.getUnits() : 0);
        }

        return ResponseEntity.ok(bloodRequestRepository.save(request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BloodRequest> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        BloodRequest request = bloodRequestRepository.findById(id).orElseThrow();
        request.setStatus(RequestStatus.valueOf(body.get("status").toUpperCase()));
        return ResponseEntity.ok(bloodRequestRepository.save(request));
    }

    private BloodType parseBloodType(String raw) {
        return BloodType.valueOf(raw
                .replace("AB+", "AB_POSITIVE").replace("AB-", "AB_NEGATIVE")
                .replace("O+",  "O_POSITIVE") .replace("O-",  "O_NEGATIVE")
                .replace("A+",  "A_POSITIVE") .replace("A-",  "A_NEGATIVE")
                .replace("B+",  "B_POSITIVE") .replace("B-",  "B_NEGATIVE"));
    }

    @GetMapping("/active-count")
    public ResponseEntity<Map<String, Long>> getActiveCount(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        long count;
        if (user.getRole() == UserRole.HSA) {
            count = bloodRequestRepository.countByStatus(RequestStatus.PENDING);
        } else {
            count = bloodRequestRepository.findByRequestingHospital(user.getHospital())
                    .stream().filter(r -> r.getStatus() == RequestStatus.PENDING
                            || r.getStatus() == RequestStatus.APPROVED
                            || r.getStatus() == RequestStatus.IN_TRANSIT).count();
        }
        return ResponseEntity.ok(Map.of("count", count));
    }
}
