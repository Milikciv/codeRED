package com.codered.repository;

import com.codered.model.DonorDemographic;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DonorDemographicRepository extends JpaRepository<DonorDemographic, Long> {
    List<DonorDemographic> findByCategoryOrderBySortOrderAsc(String category);
    boolean existsByCategory(String category);
}
