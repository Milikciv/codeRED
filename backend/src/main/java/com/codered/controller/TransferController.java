package com.codered.controller;

import com.codered.model.BloodTransfer;
import com.codered.model.User;
import com.codered.repository.BloodTransferRepository;
import com.codered.repository.UserRepository;
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

    private final BloodTransferRepository bloodTransferRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<BloodTransfer>> getTransfers(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(bloodTransferRepository.findByDonorHospitalOrderByCreatedAtDesc(user.getHospital()));
    }

    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<BloodTransfer> acknowledge(@PathVariable Long id) {
        BloodTransfer transfer = bloodTransferRepository.findById(id).orElseThrow();
        transfer.setStatus("ACKNOWLEDGED");
        return ResponseEntity.ok(bloodTransferRepository.save(transfer));
    }
}
