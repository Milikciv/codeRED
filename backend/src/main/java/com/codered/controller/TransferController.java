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

    @GetMapping
    public ResponseEntity<List<BloodTransfer>> getTransfers(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(transferService.getTransfers(userDetails));
    }

    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<BloodTransfer> acknowledge(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.acknowledge(id));
    }

    @PatchMapping("/{id}/ready-for-pickup")
    public ResponseEntity<BloodTransfer> readyForPickup(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.readyForPickup(id));
    }

    @PatchMapping("/{id}/confirm-delivered")
    public ResponseEntity<BloodTransfer> confirmDelivered(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.confirmDelivered(id));
    }
}
