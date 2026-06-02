package com.codered.repository;

import com.codered.model.DonorHotspot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DonorHotspotRepository extends JpaRepository<DonorHotspot, Long> {
    List<DonorHotspot> findAllByOrderByRankAsc();
}
