package com.codered.repository;

import com.codered.model.BloodStockHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BloodStockHistoryRepository
        extends JpaRepository<BloodStockHistory, Long> {

    List<BloodStockHistory> findBySnapshotDateBetweenOrderBySnapshotDateAsc(
            LocalDate startDate,
            LocalDate endDate);
}
