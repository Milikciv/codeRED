package com.codered.repository;

import com.codered.model.RecommendedDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RecommendedDriveRepository extends JpaRepository<RecommendedDrive, Long> {
    Optional<RecommendedDrive> findByAlertCode(String alertCode);
}
