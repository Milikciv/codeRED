package com.codered.repository;

import com.codered.model.SrcAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SrcAlertRepository extends JpaRepository<SrcAlert, Long> {
    Optional<SrcAlert> findByAlertCode(String alertCode);
    List<SrcAlert> findAllByOrderByCreatedAtDesc();
}
