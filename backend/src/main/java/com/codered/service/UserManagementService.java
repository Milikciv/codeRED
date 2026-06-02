package com.codered.service;

import com.codered.dto.CreateUserRequest;
import com.codered.dto.UserDTO;
import com.codered.model.User;
import com.codered.model.enums.UserRole;
import com.codered.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserManagementService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDTO> getUsers(User caller) {
        return userRepository.findAll().stream().map(UserDTO::from).collect(Collectors.toList());
    }

    public UserDTO createUser(CreateUserRequest req, User caller) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        UserRole role = parseRole(req.getRole());
        validateManageableRole(role);

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword() != null ? req.getPassword() : "changeme123"));
        user.setRole(role);
        user.setDesignation(req.getDesignation());
        user.setContactNumber(req.getContactNumber());

        return UserDTO.from(userRepository.save(user));
    }

    public UserDTO updateUser(Long id, CreateUserRequest req, User caller) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        checkEditAccess(user, caller);

        UserRole role = parseRole(req.getRole());
        validateManageableRole(role);

        if (!user.getEmail().equals(req.getEmail()) && userRepository.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setRole(role);
        user.setDesignation(req.getDesignation());
        user.setContactNumber(req.getContactNumber());

        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }

        return UserDTO.from(userRepository.save(user));
    }

    public void deleteUser(Long id, User caller) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        checkEditAccess(user, caller);

        if (user.getId().equals(caller.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete your own account");
        }

        userRepository.delete(user);
    }

    private void checkEditAccess(User target, User caller) {
        // Access is already restricted to ADMIN at the controller.
    }

    private void validateManageableRole(UserRole role) {
        if (role != UserRole.ADMIN && role != UserRole.HSA && role != UserRole.SRC_STAFF) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported role: " + role);
        }
    }

    private UserRole parseRole(String role) {
        try {
            return UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + role);
        }
    }
}
