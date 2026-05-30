package com.codered.repository;

import com.codered.model.BloodTransfer;
import com.codered.model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BloodTransferRepository extends JpaRepository<BloodTransfer, Long> {
    List<BloodTransfer> findByDonorHospitalOrderByCreatedAtDesc(Hospital donorHospital);
    List<BloodTransfer> findByReceivingHospitalOrderByCreatedAtDesc(Hospital receivingHospital);
    List<BloodTransfer> findAllByOrderByCreatedAtDesc();
}
