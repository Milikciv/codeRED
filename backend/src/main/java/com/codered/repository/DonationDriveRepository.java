package com.codered.repository;

import com.codered.model.DonationDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DonationDriveRepository extends JpaRepository<DonationDrive, Long> {
    Optional<DonationDrive> findByDriveCode(String driveCode);
    List<DonationDrive> findAllByOrderByDateAsc();
}
