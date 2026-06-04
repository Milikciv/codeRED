package com.codered.service;

import com.codered.model.BloodStock;
import com.codered.model.BloodStockHistory;
import com.codered.model.Hospital;
import com.codered.repository.BloodStockHistoryRepository;
import com.codered.repository.BloodStockRepository;
import com.codered.repository.HospitalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BloodStockService {

    private final BloodStockRepository bloodStockRepository;
    private final BloodStockHistoryRepository bloodStockHistoryRepository;
    private final HospitalRepository hospitalRepository;

    public Map<String, Object> getAllStockGrouped() {
        return hospitalRepository.findAll().stream()
            .collect(Collectors.toMap(Hospital::getCode, bloodStockRepository::findByHospital));
    }

    public List<Hospital> getAllHospitals() {
        return hospitalRepository.findAll();
    }

    public List<BloodStock> getStockByHospital(String code) {
        Hospital hospital = hospitalRepository.findByCode(code).orElseThrow();
        return bloodStockRepository.findByHospital(hospital);
    }

    public Map<String, Object> getSummary() {
        List<BloodStock> stocks = bloodStockRepository.findAll();
        double totalCurrent = stocks.stream().mapToInt(BloodStock::getCurrentUnits).sum();
        double totalIdeal   = stocks.stream().mapToInt(BloodStock::getIdealUnits).sum();
        double percentage   = totalIdeal > 0 ? (totalCurrent / totalIdeal) * 100 : 0;
        long criticalTypes  = stocks.stream().filter(s -> s.getSupplyPercentage() < 40).count();

        return Map.of(
            "percentage",       Math.round(percentage),
            "criticalTypeCount", criticalTypes,
            "totalUnits",       (int) totalCurrent
        );
    }

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
