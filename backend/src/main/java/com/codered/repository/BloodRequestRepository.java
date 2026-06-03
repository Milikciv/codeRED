package com.codered.repository;

import com.codered.model.BloodRequest;
import com.codered.model.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime; // <-- Added this import
import java.util.List;
import java.util.Optional;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {
    List<BloodRequest> findAllByOrderByRequestedAtDesc();
    long countByStatus(RequestStatus status);
    Optional<BloodRequest> findByRequestId(String requestId);

    // <-- THIS IS THE MISSING LINE -->
    List<BloodRequest> findByRequestedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
}