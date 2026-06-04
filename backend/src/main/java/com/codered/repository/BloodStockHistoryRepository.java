package com.codered.repository;

import com.codered.model.BloodStockHistory;
import com.codered.model.Hospital;
import com.codered.model.enums.BloodType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BloodStockHistoryRepository
        extends JpaRepository<BloodStockHistory, Long> {

    List<BloodStockHistory> findBySnapshotDateBetweenOrderBySnapshotDateAsc(
            LocalDate startDate,
            LocalDate endDate);

    Optional<BloodStockHistory> findByHospitalAndBloodTypeAndSnapshotDate(
            Hospital hospital,
            BloodType bloodType,
            LocalDate snapshotDate);
}
