package com.codered.service;

import com.codered.dto.LoginRequest;
import com.codered.dto.LoginResponse;
import com.codered.model.User;
import com.codered.repository.UserRepository;
import com.codered.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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

        return buildResponse(user);
    }

    public LoginResponse refresh(String refreshToken) {
        if (!jwtUtil.isRefreshToken(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        String email = jwtUtil.extractEmail(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        return buildResponse(user);
    }

    private LoginResponse buildResponse(User user) {
        String accessToken  = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        String refreshToken = jwtUtil.generateRefreshToken(user.getEmail());
        return new LoginResponse(
                accessToken,
                refreshToken,
                user.getRole().name(),
                user.getName(),
                user.getEmail(),
                null,
                displayContext(user),
                user.getDesignation()
        );
    }

    private String displayContext(User user) {
        return switch (user.getRole()) {
            case ADMIN -> "Admin";
            case HSA -> "Health Sciences Authority";
            case SRC_STAFF -> "Singapore Red Cross";
        };
    }
}
