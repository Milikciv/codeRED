package com.codered.controller;

import com.codered.model.Alert;
import com.codered.model.BloodRequest;
import com.codered.model.BloodStock;
import com.codered.model.Hospital;
import com.codered.model.enums.Priority;
import com.codered.model.enums.RequestStatus;
import com.codered.repository.AlertRepository;
import com.codered.repository.BloodRequestRepository;
import com.codered.repository.BloodStockRepository;
import com.codered.repository.HospitalRepository;
import com.codered.service.TransferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/allocation")
@RequiredArgsConstructor
public class AllocationController {

    private static final String HSA_CODE = "HSA";
    private static final double CRITICAL_THRESHOLD = 0.25;
    private static final double SAFE_TRANSFER_THRESHOLD = 0.70;
    private static final double CAUTION_TRANSFER_THRESHOLD = 0.40;

    private final BloodStockRepository bloodStockRepository;
    private final HospitalRepository hospitalRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final AlertRepository alertRepository;
    private final TransferService transferService;

    /**
     * Returns HSA Blood Services' own national inventory.
     * This is the primary source for fulfilling hospital requests.
     */
    @GetMapping("/inventory")
    public ResponseEntity<Map<String, Object>> getInventory() {
        Hospital hsa = hsaHospital();
        List<BloodStock> hsaStock = bloodStockRepository.findByHospital(hsa);

        Map<String, Integer> byType = hsaStock.stream()
                .collect(Collectors.toMap(
                        s -> s.getBloodType().getLabel(),
                        BloodStock::getCurrentUnits
                ));
        int totalStock = hsaStock.stream().mapToInt(BloodStock::getCurrentUnits).sum();

        return ResponseEntity.ok(Map.of(
                "totalStock", totalStock,
                "byType", byType
        ));
    }

    /**
     * Assesses where blood should come from for a given request.
     *
     * Priority:
     *   1. HSA national inventory (normal case)
     *   2. Inter-hospital transfer (HSA stock insufficient)
     *   3. National donor appeal (critically low everywhere)
     */
    @GetMapping("/assess/{requestId}")
    public ResponseEntity<Map<String, Object>> assess(@PathVariable Long requestId) {
        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        Hospital hsa = hsaHospital();
        int hsaUnits = bloodStockRepository
                .findByHospitalAndBloodType(hsa, request.getBloodType())
                .map(BloodStock::getCurrentUnits)
                .orElse(0);

        boolean hsaCanFulfill = hsaUnits >= request.getUnitsRequested();

        List<Map<String, Object>> hospitalOptions = hospitalRepository.findAll().stream()
                .filter(h -> !h.getCode().equals(HSA_CODE)
                        && !h.getId().equals(request.getRequestingHospital().getId()))
                .map(h -> buildHospitalOption(h, request))
                .collect(Collectors.toList());

        boolean nationallyLow = isNationallyLow(request);

        String recommendedSource = hsaCanFulfill ? "HSA"
                : nationallyLow ? "APPEAL"
                : "INTER_HOSPITAL";

        return ResponseEntity.ok(Map.of(
                "requestId", requestId,
                "bloodType", request.getBloodType().getLabel(),
                "unitsRequested", request.getUnitsRequested(),
                "hsaUnitsAvailable", hsaUnits,
                "hsaCanFulfill", hsaCanFulfill,
                "recommendedSource", recommendedSource,
                "hospitalOptions", hospitalOptions,
                "nationallyLow", nationallyLow
        ));
    }

    @GetMapping("/donor-hospitals/{requestId}")
    public ResponseEntity<List<Map<String, Object>>> getDonorHospitals(@PathVariable Long requestId) {
        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        List<Map<String, Object>> result = hospitalRepository.findAll().stream()
                .filter(h -> !h.getCode().equals(HSA_CODE)
                        && !h.getId().equals(request.getRequestingHospital().getId()))
                .map(h -> buildHospitalOption(h, request))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Approves a mixed allocation: any combination of HSA units and hospital units.
     * Payload: { requestId, hsaUnits?: int, allocations?: { hospitalId: units } }
     * At least one of hsaUnits > 0 or a non-empty allocations map must be provided.
     */
    @PostMapping("/approve")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> approve(@RequestBody Map<String, Object> body) {
        Long requestId = Long.valueOf(body.get("requestId").toString());
        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        int hsaUnits = body.get("hsaUnits") != null ? Integer.parseInt(body.get("hsaUnits").toString()) : 0;
        Map<String, Object> allocations = body.get("allocations") != null
                ? (Map<String, Object>) body.get("allocations")
                : Map.of();

        int hospitalUnits = allocations.values().stream().mapToInt(v -> Integer.parseInt(v.toString())).sum();
        if (hsaUnits <= 0 && hospitalUnits <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No units allocated");
        }

        // Deduct HSA stock and create HSA delivery transfer
        if (hsaUnits > 0) {
            Hospital hsa = hsaHospital();
            BloodStock hsaStock = bloodStockRepository
                    .findByHospitalAndBloodType(hsa, request.getBloodType())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "HSA has no stock for " + request.getBloodType()));
            if (hsaStock.getCurrentUnits() < hsaUnits) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Insufficient HSA stock: " + hsaStock.getCurrentUnits() + " available, " + hsaUnits + " requested");
            }
            hsaStock.setCurrentUnits(hsaStock.getCurrentUnits() - hsaUnits);
            bloodStockRepository.save(hsaStock);
            transferService.createFromAllocation(hsa, request.getRequestingHospital(), request, hsaUnits, "DEL");
        }

        // Create hospital-to-hospital transfer records
        for (Map.Entry<String, Object> entry : allocations.entrySet()) {
            int units = Integer.parseInt(entry.getValue().toString());
            if (units <= 0) continue;
            Hospital donor = hospitalRepository.findById(Long.valueOf(entry.getKey()))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hospital not found"));
            transferService.createFromAllocation(donor, request.getRequestingHospital(), request, units, "TRF");
        }

        request.setStatus(hsaUnits > 0 && hospitalUnits == 0 ? RequestStatus.IN_TRANSIT : RequestStatus.APPROVED);
        bloodRequestRepository.save(request);

        String msg = buildApprovalMessage(hsaUnits, hospitalUnits, request);
        return ResponseEntity.ok(Map.of("status", "success", "message", msg));
    }

    private String buildApprovalMessage(int hsaUnits, int hospitalUnits, BloodRequest request) {
        String type = request.getBloodType().getLabel();
        if (hsaUnits > 0 && hospitalUnits > 0) {
            return "Mixed allocation approved: " + hsaUnits + " units from HSA + " + hospitalUnits + " units from hospitals for " + type;
        } else if (hsaUnits > 0) {
            return "HSA Blood Services will dispatch " + hsaUnits + " units of " + type;
        } else {
            return "Inter-hospital transfer of " + hospitalUnits + " units of " + type + " initiated";
        }
    }

    /**
     * Triggers a national donor appeal for critically low blood types.
     * Creates a CRITICAL alert visible to all HSA staff.
     */
    @PostMapping("/trigger-appeal")
    public ResponseEntity<Map<String, Object>> triggerAppeal(@RequestBody Map<String, Object> body) {
        Long requestId = Long.valueOf(body.get("requestId").toString());
        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        String bloodType = request.getBloodType().getLabel();

        Alert appeal = new Alert();
        appeal.setTitle("National Donor Appeal — " + bloodType + " Critically Low");
        appeal.setMessage("National " + bloodType + " blood supply is critically low. "
                + "Triggered by request " + request.getRequestId() + " from "
                + request.getRequestingHospital().getName()
                + ". Immediate public donor recruitment required.");
        appeal.setPriority(Priority.CRITICAL);
        appeal.setLocation("National");
        appeal.setDismissed(false);
        alertRepository.save(appeal);

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "National donor appeal triggered for " + bloodType
        ));
    }

    // --- private helpers ---

    private Map<String, Object> buildHospitalOption(Hospital h, BloodRequest request) {
        BloodStock stock = bloodStockRepository
                .findByHospitalAndBloodType(h, request.getBloodType())
                .orElse(null);

        int current = stock != null ? stock.getCurrentUnits() : 0;
        int ideal   = stock != null ? stock.getIdealUnits()   : 1;
        double pct  = (double) current / ideal * 100;

        String safeToTransfer = pct >= SAFE_TRANSFER_THRESHOLD * 100 ? "Yes"
                : pct >= CAUTION_TRANSFER_THRESHOLD * 100 ? "Caution" : "No";
        int maxTransfer = Math.max(0, current - (int) (ideal * CAUTION_TRANSFER_THRESHOLD));

        return Map.of(
                "hospitalId",      h.getId(),
                "hospitalName",    h.getName(),
                "hospitalCode",    h.getCode(),
                "stock",           current,
                "stockPct",        (int) pct,
                "safeToTransfer",  safeToTransfer,
                "maxSafeTransfer", maxTransfer
        );
    }

    private boolean isNationallyLow(BloodRequest request) {
        List<BloodStock> allOfType = bloodStockRepository.findAll().stream()
                .filter(s -> s.getBloodType() == request.getBloodType())
                .toList();
        int totalCurrent = allOfType.stream().mapToInt(BloodStock::getCurrentUnits).sum();
        int totalIdeal   = allOfType.stream().mapToInt(BloodStock::getIdealUnits).sum();
        return totalIdeal > 0 && (double) totalCurrent / totalIdeal < CRITICAL_THRESHOLD;
    }

    private Hospital hsaHospital() {
        return hospitalRepository.findByCode(HSA_CODE)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "HSA hospital entity not found in database"));
    }
}
