package com.codered.repository;

import com.codered.model.BloodRequest;
import com.codered.model.Hospital;
import com.codered.model.enums.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {
    List<BloodRequest> findByRequestingHospital(Hospital hospital);
    List<BloodRequest> findByRequestingHospitalOrderByRequestedAtDesc(Hospital hospital);
    List<BloodRequest> findAllByOrderByRequestedAtDesc();
    List<BloodRequest> findByStatus(RequestStatus status);
    long countByStatus(RequestStatus status);
    Optional<BloodRequest> findByRequestId(String requestId);
}
