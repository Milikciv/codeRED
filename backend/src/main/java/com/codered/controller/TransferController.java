package com.codered.controller;

import com.codered.model.BloodTransfer;
import com.codered.service.TransferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferController {

    private final TransferService transferService;

    /** All transfers visible to the caller (donor + receiver for hospitals; all for HSA). */
    @GetMapping
    public ResponseEntity<List<BloodTransfer>> getTransfers(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(transferService.getTransfers(userDetails));
    }

    /** Only transfers where the caller's hospital is the donor — for the "Transfers Out" tab. */
    @GetMapping("/outbound")
    public ResponseEntity<List<BloodTransfer>> getOutboundTransfers(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(transferService.getOutboundTransfers(userDetails));
    }

    /** All transfers linked to a specific request. */
    @GetMapping("/by-request/{requestId}")
    public ResponseEntity<List<BloodTransfer>> getByRequest(
            @PathVariable Long requestId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(transferService.getTransfersByRequest(requestId, userDetails));
    }

    // --- Supplier (donor hospital) status transitions ---

    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<BloodTransfer> acknowledge(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.acknowledge(id));
    }

    @PatchMapping("/{id}/prepare")
    public ResponseEntity<BloodTransfer> prepare(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.prepare(id));
    }

    @PatchMapping("/{id}/ready-for-pickup")
    public ResponseEntity<BloodTransfer> readyForPickup(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.readyForPickup(id));
    }

    @PatchMapping("/{id}/dispatch")
    public ResponseEntity<BloodTransfer> dispatch(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.dispatch(id));
    }

    // --- Receiver (requester hospital) action ---

    @PatchMapping("/{id}/confirm-delivered")
    public ResponseEntity<BloodTransfer> confirmDelivered(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.confirmDelivered(id));
    }
}
