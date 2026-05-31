package com.codered.controller;

import com.codered.dto.CreateUserRequest;
import com.codered.dto.UserDTO;
import com.codered.model.Hospital;
import com.codered.model.User;
import com.codered.model.enums.UserRole;
import com.codered.repository.HospitalRepository;
import com.codered.repository.UserRepository;
import com.codered.service.UserManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserManagementService userManagementService;
    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;

    private User resolveUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    private void requireAdminRole(User caller) {
        if (caller.getRole() != UserRole.HSA && caller.getRole() != UserRole.HOSPITAL_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
        }
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getUsers(@AuthenticationPrincipal UserDetails userDetails) {
        User caller = resolveUser(userDetails);
        requireAdminRole(caller);
        return ResponseEntity.ok(userManagementService.getUsers(caller));
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(
            @RequestBody CreateUserRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        User caller = resolveUser(userDetails);
        requireAdminRole(caller);
        return ResponseEntity.status(HttpStatus.CREATED).body(userManagementService.createUser(req, caller));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @RequestBody CreateUserRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        User caller = resolveUser(userDetails);
        requireAdminRole(caller);
        return ResponseEntity.ok(userManagementService.updateUser(id, req, caller));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User caller = resolveUser(userDetails);
        requireAdminRole(caller);
        userManagementService.deleteUser(id, caller);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/hospitals")
    public ResponseEntity<List<Hospital>> getHospitals() {
        return ResponseEntity.ok(hospitalRepository.findAll());
    }
}
