package com.codered.repository;

import com.codered.model.RecommendedDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RecommendedDriveRepository extends JpaRepository<RecommendedDrive, Long> {
    Optional<RecommendedDrive> findByAlertCodeAndRank(String alertCode, int rank);
    List<RecommendedDrive> findByAlertCodeAndRankGreaterThanOrderByRankAsc(String alertCode, int rank);
    List<RecommendedDrive> findByAlertCodeOrderByRankAsc(String alertCode);
}
