package com.codered.service;

import com.codered.model.BloodRequest;
import com.codered.model.enums.RequestStatus;
import com.codered.repository.BloodRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BloodRequestService {

    private final BloodRequestRepository bloodRequestRepository;

    public List<BloodRequest> getRequests() {
        return bloodRequestRepository.findAllByOrderByRequestedAtDesc();
    }

    public BloodRequest updateStatus(Long id, String status) {
        BloodRequest request = bloodRequestRepository.findById(id).orElseThrow();
        request.setStatus(RequestStatus.valueOf(status.toUpperCase()));
        return bloodRequestRepository.save(request);
    }

    public long getActiveCount() {
        return bloodRequestRepository.countByStatus(RequestStatus.PENDING);
    }
}
