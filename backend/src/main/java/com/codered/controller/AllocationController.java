package com.codered.controller;

import com.codered.model.Alert;
import com.codered.model.BloodRequest;
import com.codered.model.BloodStock;
import com.codered.model.Hospital;
import com.codered.model.enums.BloodType;
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
    public ResponseEntity<Map<String, Object>> assess(
            @PathVariable Long requestId,
            @RequestParam(required = false) String bloodType) {
        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        // Resolve which blood type and units to assess
        BloodType effectiveType = request.getBloodType();
        int effectiveUnits = request.getUnitsRequested();
        if (bloodType != null) {
            try {
                BloodType parsed = BloodType.valueOf(bloodType);
                int perTypeUnits = request.getBloodItems().stream()
                        .filter(i -> i.getBloodType() == parsed)
                        .mapToInt(i -> i.getUnits())
                        .findFirst().orElse(effectiveUnits);
                effectiveType = parsed;
                effectiveUnits = perTypeUnits;
            } catch (IllegalArgumentException ignored) {}
        }
        final BloodType assessType = effectiveType;
        final int assessUnits = effectiveUnits;

        Hospital hsa = hsaHospital();
        int hsaUnits = bloodStockRepository
                .findByHospitalAndBloodType(hsa, assessType)
                .map(BloodStock::getCurrentUnits)
                .orElse(0);

        boolean hsaCanFulfill = hsaUnits >= assessUnits;

        List<Map<String, Object>> hospitalOptions = hospitalRepository.findAll().stream()
                .filter(h -> !h.getCode().equals(HSA_CODE)
                        && !h.getId().equals(request.getRequestingHospital().getId()))
                .map(h -> buildHospitalOptionForType(h, request, assessType))
                .collect(Collectors.toList());

        boolean nationallyLow = isNationallyLowForType(request, assessType);

        String recommendedSource = hsaCanFulfill ? "HSA"
                : nationallyLow ? "APPEAL"
                : "INTER_HOSPITAL";

        return ResponseEntity.ok(Map.of(
                "requestId", requestId,
                "bloodType", assessType.getLabel(),
                "unitsRequested", assessUnits,
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
                .map(h -> buildHospitalOptionForType(h, request, request.getBloodType()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    /**
     * Approves a multi-type allocation plan and creates the resulting transfers.
     *
     * Payload:
     * {
     *   requestId: Long,
     *   perTypeAllocations: [
     *     { bloodType: "O_POSITIVE", hsaUnits: 10, allocations: { "hospitalId": units } },
     *     ...
     *   ]
     * }
     */
    @PostMapping("/approve")
    @SuppressWarnings("unchecked")
    public ResponseEntity<Map<String, Object>> approve(@RequestBody Map<String, Object> body) {
        Long requestId = Long.valueOf(body.get("requestId").toString());
        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));

        List<Map<String, Object>> perTypeAllocations = (List<Map<String, Object>>) body.get("perTypeAllocations");
        if (perTypeAllocations == null || perTypeAllocations.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No allocation data provided");
        }

        int totalHsaUnits = 0;
        int totalHospitalUnits = 0;
        Hospital hsa = hsaHospital();

        for (Map<String, Object> typeAlloc : perTypeAllocations) {
            BloodType bloodType = BloodType.valueOf(typeAlloc.get("bloodType").toString());
            int hsaUnits = typeAlloc.get("hsaUnits") != null ? Integer.parseInt(typeAlloc.get("hsaUnits").toString()) : 0;
            Map<String, Object> allocations = typeAlloc.get("allocations") != null
                    ? (Map<String, Object>) typeAlloc.get("allocations")
                    : Map.of();

            if (hsaUnits > 0) {
                BloodStock hsaStock = bloodStockRepository
                        .findByHospitalAndBloodType(hsa, bloodType)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "HSA has no stock for " + bloodType));
                if (hsaStock.getCurrentUnits() < hsaUnits) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT,
                            "Insufficient HSA stock for " + bloodType.getLabel() + ": "
                                    + hsaStock.getCurrentUnits() + " available, " + hsaUnits + " requested");
                }
                hsaStock.setCurrentUnits(hsaStock.getCurrentUnits() - hsaUnits);
                bloodStockRepository.save(hsaStock);
                transferService.createFromAllocation(hsa, request.getRequestingHospital(), request, hsaUnits, "DEL", bloodType);
                totalHsaUnits += hsaUnits;
            }

            for (Map.Entry<String, Object> entry : allocations.entrySet()) {
                int units = Integer.parseInt(entry.getValue().toString());
                if (units <= 0) continue;
                Hospital donor = hospitalRepository.findById(Long.valueOf(entry.getKey()))
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Hospital not found"));
                transferService.createFromAllocation(donor, request.getRequestingHospital(), request, units, "TRF", bloodType);
                totalHospitalUnits += units;
            }
        }

        if (totalHsaUnits == 0 && totalHospitalUnits == 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No units allocated");
        }

        request.setStatus(RequestStatus.APPROVED);
        bloodRequestRepository.save(request);

        String msg = "Allocation approved: " + (totalHsaUnits > 0 ? totalHsaUnits + " units from HSA" : "")
                + (totalHsaUnits > 0 && totalHospitalUnits > 0 ? " + " : "")
                + (totalHospitalUnits > 0 ? totalHospitalUnits + " units from hospitals" : "");
        return ResponseEntity.ok(Map.of("status", "success", "message", msg));
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
        return buildHospitalOptionForType(h, request, request.getBloodType());
    }

    private Map<String, Object> buildHospitalOptionForType(Hospital h, BloodRequest request, BloodType type) {
        BloodStock stock = bloodStockRepository
                .findByHospitalAndBloodType(h, type)
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
        return isNationallyLowForType(request, request.getBloodType());
    }

    private boolean isNationallyLowForType(BloodRequest request, BloodType type) {
        List<BloodStock> allOfType = bloodStockRepository.findAll().stream()
                .filter(s -> s.getBloodType() == type)
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
