package com.codered.service;

import com.codered.model.BloodRequest;
import com.codered.model.BloodTransfer;
import com.codered.model.Hospital;
import com.codered.model.User;
import com.codered.repository.BloodRequestRepository;
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
    private final BloodRequestRepository bloodRequestRepository;
    private final UserRepository userRepository;

    /** All transfers visible to the caller: HSA sees everything; hospital sees as donor + as receiver. */
    public List<BloodTransfer> getTransfers(UserDetails userDetails) {
        User user = resolveUser(userDetails);
        if (user.getHospital() == null) {
            return bloodTransferRepository.findAllByOrderByCreatedAtDesc();
        }
        Hospital hospital = user.getHospital();
        List<BloodTransfer> all = new ArrayList<>();
        all.addAll(bloodTransferRepository.findByDonorHospitalOrderByCreatedAtDesc(hospital));
        all.addAll(bloodTransferRepository.findByReceivingHospitalOrderByCreatedAtDesc(hospital));
        all.sort(Comparator.comparing(BloodTransfer::getCreatedAt).reversed());
        return all;
    }

    /** Only transfers where the caller's hospital is the donor (for "Transfers Out" tab). */
    public List<BloodTransfer> getOutboundTransfers(UserDetails userDetails) {
        User user = resolveUser(userDetails);
        if (user.getHospital() == null) {
            return bloodTransferRepository.findAllByOrderByCreatedAtDesc();
        }
        return bloodTransferRepository.findByDonorHospitalOrderByCreatedAtDesc(user.getHospital());
    }

    /** All transfers under a specific request. HSA may see any; hospital must own the request. */
    public List<BloodTransfer> getTransfersByRequest(Long requestId, UserDetails userDetails) {
        User user = resolveUser(userDetails);
        BloodRequest request = bloodRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Request not found"));
        if (user.getHospital() != null
                && !request.getRequestingHospital().getId().equals(user.getHospital().getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return bloodTransferRepository.findByBloodRequest_IdOrderByCreatedAtDesc(requestId);
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

    /** Donor hospital acknowledges a PENDING inter-hospital transfer. */
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

    /** Donor hospital marks blood as being prepared (ACKNOWLEDGED → PREPARING). */
    public BloodTransfer prepare(Long id) {
        BloodTransfer transfer = findOrThrow(id);
        if (isHsaDelivery(transfer)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "HSA deliveries do not go through the preparation step");
        }
        if (!"ACKNOWLEDGED".equals(transfer.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Transfer must be ACKNOWLEDGED to mark as preparing (current: " + transfer.getStatus() + ")");
        }
        transfer.setStatus("PREPARING");
        return bloodTransferRepository.save(transfer);
    }

    /** Donor hospital signals blood is packed and ready for courier pickup (ACKNOWLEDGED/PREPARING → READY_FOR_PICKUP). */
    public BloodTransfer readyForPickup(Long id) {
        BloodTransfer transfer = findOrThrow(id);
        if (isHsaDelivery(transfer)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "HSA deliveries have no pickup step — HSA handles logistics directly");
        }
        String status = transfer.getStatus();
        if (!"ACKNOWLEDGED".equals(status) && !"PREPARING".equals(status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Transfer must be ACKNOWLEDGED or PREPARING before marking ready for pickup (current: " + status + ")");
        }
        transfer.setStatus("READY_FOR_PICKUP");
        return bloodTransferRepository.save(transfer);
    }

    /** Donor hospital dispatches the blood — marks it in transit (READY_FOR_PICKUP → IN_TRANSIT). */
    public BloodTransfer dispatch(Long id) {
        BloodTransfer transfer = findOrThrow(id);
        if (isHsaDelivery(transfer)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "HSA deliveries are already dispatched at creation");
        }
        if (!"READY_FOR_PICKUP".equals(transfer.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Transfer must be READY_FOR_PICKUP to dispatch (current: " + transfer.getStatus() + ")");
        }
        transfer.setStatus("IN_TRANSIT");
        return bloodTransferRepository.save(transfer);
    }

    /**
     * Receiving hospital confirms the blood has arrived.
     * Valid for HSA deliveries (IN_TRANSIT → RECEIVED)
     * and hospital transfers (IN_TRANSIT → RECEIVED).
     */
    public BloodTransfer confirmDelivered(Long id) {
        BloodTransfer transfer = findOrThrow(id);
        String status = transfer.getStatus();
        if (!"IN_TRANSIT".equals(status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Transfer must be IN_TRANSIT to confirm receipt (current: " + status + ")");
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
