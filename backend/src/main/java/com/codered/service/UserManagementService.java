package com.codered.service;

import com.codered.dto.CreateUserRequest;
import com.codered.dto.UserDTO;
import com.codered.model.Hospital;
import com.codered.model.User;
import com.codered.model.enums.UserRole;
import com.codered.repository.HospitalRepository;
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
    private final HospitalRepository hospitalRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserDTO> getUsers(User caller) {
        List<User> users;
        if (caller.getRole() == UserRole.HSA) {
            users = userRepository.findAll();
        } else {
            // HOSPITAL_ADMIN sees only their own hospital
            users = userRepository.findByHospital_Id(caller.getHospital().getId());
        }
        return users.stream().map(UserDTO::from).collect(Collectors.toList());
    }

    public UserDTO createUser(CreateUserRequest req, User caller) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        UserRole role = parseRole(req.getRole());
        if (caller.getRole() == UserRole.HOSPITAL_ADMIN) {
            // Hospital admins can only create staff/admins within their own hospital
            if (role == UserRole.HSA) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot create HSA users");
            }
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword() != null ? req.getPassword() : "changeme123"));
        user.setRole(role);
        user.setDesignation(req.getDesignation());
        user.setContactNumber(req.getContactNumber());
        user.setHospital(resolveHospital(req.getHospitalId(), caller));

        return UserDTO.from(userRepository.save(user));
    }

    public UserDTO updateUser(Long id, CreateUserRequest req, User caller) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        checkEditAccess(user, caller);

        UserRole role = parseRole(req.getRole());
        if (caller.getRole() == UserRole.HOSPITAL_ADMIN && role == UserRole.HSA) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot assign HSA role");
        }

        if (!user.getEmail().equals(req.getEmail()) && userRepository.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
        }

        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setRole(role);
        user.setDesignation(req.getDesignation());
        user.setContactNumber(req.getContactNumber());
        user.setHospital(resolveHospital(req.getHospitalId(), caller));

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
        if (caller.getRole() == UserRole.HOSPITAL_ADMIN) {
            if (target.getHospital() == null ||
                !target.getHospital().getId().equals(caller.getHospital().getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            }
        }
    }

    private Hospital resolveHospital(Long hospitalId, User caller) {
        if (hospitalId != null) {
            return hospitalRepository.findById(hospitalId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Hospital not found"));
        }
        // Hospital admins default to their own hospital
        if (caller.getRole() == UserRole.HOSPITAL_ADMIN) {
            return caller.getHospital();
        }
        return null;
    }

    private UserRole parseRole(String role) {
        try {
            return UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role: " + role);
        }
    }
}
