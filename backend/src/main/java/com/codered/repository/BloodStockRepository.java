package com.codered.repository;

import com.codered.model.BloodStock;
import com.codered.model.Hospital;
import com.codered.model.enums.BloodType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BloodStockRepository extends JpaRepository<BloodStock, Long> {
    List<BloodStock> findByHospital(Hospital hospital);
    List<BloodStock> findByHospitalId(Long hospitalId);
    Optional<BloodStock> findByHospitalAndBloodType(Hospital hospital, BloodType bloodType);
}
