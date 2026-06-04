package com.codered.service;

import com.codered.model.BloodStock;
import com.codered.model.BloodStockHistory;
import com.codered.repository.BloodStockHistoryRepository;
import com.codered.repository.BloodStockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class BloodStockService {

    private final BloodStockRepository bloodStockRepository;
    private final BloodStockHistoryRepository bloodStockHistoryRepository;

    @Transactional
    public BloodStock updateStock(Long id, int newCurrentUnits) {
        BloodStock stock = bloodStockRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("BloodStock not found: " + id));

        stock.setCurrentUnits(newCurrentUnits);
        BloodStock saved = bloodStockRepository.save(stock);

        upsertTodaySnapshot(saved);
        return saved;
    }

    private void upsertTodaySnapshot(BloodStock stock) {
        LocalDate today = LocalDate.now();

        bloodStockHistoryRepository
                .findByHospitalAndBloodTypeAndSnapshotDate(stock.getHospital(), stock.getBloodType(), today)
                .ifPresentOrElse(
                        existing -> {
                            existing.setCurrentUnits(stock.getCurrentUnits());
                            existing.setIdealUnits(stock.getIdealUnits());
                            bloodStockHistoryRepository.save(existing);
                        },
                        () -> {
                            BloodStockHistory snapshot = new BloodStockHistory();
                            snapshot.setHospital(stock.getHospital());
                            snapshot.setBloodType(stock.getBloodType());
                            snapshot.setCurrentUnits(stock.getCurrentUnits());
                            snapshot.setIdealUnits(stock.getIdealUnits());
                            snapshot.setSnapshotDate(today);
                            bloodStockHistoryRepository.save(snapshot);
                        }
                );
    }
}
