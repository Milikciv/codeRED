package com.codered.service;

import com.codered.model.BloodRequest;
import com.codered.model.BloodTransfer;
import com.codered.model.Hospital;
import com.codered.model.User;
import com.codered.repository.BloodTransferRepository;
import com.codered.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final BloodTransferRepository bloodTransferRepository;
    private final UserRepository userRepository;

    public List<BloodTransfer> getTransfers(UserDetails userDetails) {
        User user = resolveUser(userDetails);
        if (user.getHospital() == null) {
            // HSA users see all transfers
            return bloodTransferRepository.findAllByOrderByCreatedAtDesc();
        }
        Hospital hospital = user.getHospital();
        List<BloodTransfer> all = new ArrayList<>();
        all.addAll(bloodTransferRepository.findByDonorHospitalOrderByCreatedAtDesc(hospital));
        all.addAll(bloodTransferRepository.findByReceivingHospitalOrderByCreatedAtDesc(hospital));
        all.sort(Comparator.comparing(BloodTransfer::getCreatedAt).reversed());
        return all;
    }

    /**
     * Called by AllocationController when a request is approved.
     * HSA deliveries start IN_TRANSIT immediately; hospital transfers start PENDING.
     */
    public BloodTransfer createFromAllocation(Hospital donorHospital, Hospital receivingHospital,
                                               BloodRequest bloodRequest, int units, String prefix) {
        boolean isHsaDelivery = "HSA".equals(donorHospital.getCode());
        BloodTransfer transfer = new BloodTransfer();
        transfer.setTransferId(prefix + "-" + System.currentTimeMillis() % 100000);
        transfer.setDonorHospital(donorHospital);
        transfer.setReceivingHospital(receivingHospital);
        transfer.setBloodRequest(bloodRequest);
        transfer.setBloodType(bloodRequest.getBloodType());
        transfer.setUnits(units);
        transfer.setPriority(bloodRequest.getPriority());
        transfer.setStatus(isHsaDelivery ? "IN_TRANSIT" : "PENDING");
        transfer.setPurposeNotes(isHsaDelivery
                ? "HSA national inventory delivery for " + bloodRequest.getRequestId()
                : "Inter-hospital transfer for " + bloodRequest.getRequestId());
        transfer.setEstimatedDelivery(LocalDateTime.now().plusHours(isHsaDelivery ? 2 : 4));
        if (!isHsaDelivery) {
            transfer.setRequestedPickupDate(LocalDateTime.now().plusHours(1));
        }
        return bloodTransferRepository.save(transfer);
    }

    /**
     * Receiving hospital acknowledges an incoming hospital-to-hospital transfer.
     * Not applicable to HSA deliveries — those are already in transit; use confirmDelivered instead.
     */
    public BloodTransfer acknowledge(Long id) {
        BloodTransfer transfer = findOrThrow(id);
        if (isHsaDelivery(transfer)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "HSA deliveries cannot be acknowledged — use confirm-delivered to record receipt");
        }
        if (!"PENDING".equals(transfer.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Transfer must be PENDING to acknowledge (current: " + transfer.getStatus() + ")");
        }
        transfer.setStatus("ACKNOWLEDGED");
        return bloodTransferRepository.save(transfer);
    }

    /**
     * Donor hospital signals blood is packed and ready for courier pickup.
     * Only valid for hospital-to-hospital transfers in ACKNOWLEDGED state.
     */
    public BloodTransfer readyForPickup(Long id) {
        BloodTransfer transfer = findOrThrow(id);
        if (isHsaDelivery(transfer)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "HSA deliveries have no pickup step — HSA handles logistics directly");
        }
        if (!"ACKNOWLEDGED".equals(transfer.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Transfer must be ACKNOWLEDGED before marking ready for pickup (current: " + transfer.getStatus() + ")");
        }
        transfer.setStatus("READY_FOR_PICKUP");
        return bloodTransferRepository.save(transfer);
    }

    /**
     * Confirms the blood has been physically received by the hospital.
     * Valid for both HSA deliveries (IN_TRANSIT → RECEIVED)
     * and hospital transfers (READY_FOR_PICKUP or IN_TRANSIT → RECEIVED).
     */
    public BloodTransfer confirmDelivered(Long id) {
        BloodTransfer transfer = findOrThrow(id);
        String status = transfer.getStatus();
        boolean validState = isHsaDelivery(transfer)
                ? "IN_TRANSIT".equals(status)
                : "READY_FOR_PICKUP".equals(status) || "IN_TRANSIT".equals(status);
        if (!validState) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Cannot confirm delivery from current status: " + status);
        }
        transfer.setStatus("RECEIVED");
        return bloodTransferRepository.save(transfer);
    }

    private boolean isHsaDelivery(BloodTransfer transfer) {
        return transfer.getDonorHospital() != null
                && "HSA".equals(transfer.getDonorHospital().getCode());
    }

    private BloodTransfer findOrThrow(Long id) {
        return bloodTransferRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transfer not found"));
    }

    private User resolveUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
