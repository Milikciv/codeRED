package com.codered.repository;

import com.codered.model.Donor;
import com.codered.model.enums.DonorStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DonorRepository extends JpaRepository<Donor, Long> {
    long countByStatus(DonorStatus status);
    List<Donor> findByStatus(DonorStatus status);
    List<Donor> findByRegion(String region);
}
