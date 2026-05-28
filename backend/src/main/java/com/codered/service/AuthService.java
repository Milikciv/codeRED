package com.codered.service;

import com.codered.dto.LoginRequest;
import com.codered.dto.LoginResponse;
import com.codered.model.User;
import com.codered.repository.UserRepository;
import com.codered.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return new LoginResponse(
                token,
                user.getRole().name(),
                user.getName(),
                user.getEmail(),
                user.getHospital() != null ? user.getHospital().getId() : null,
                user.getHospital() != null ? user.getHospital().getName() : "Health Sciences Authority",
                user.getDesignation()
        );
    }
}
