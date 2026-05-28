package com.codered.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String role;
    private String name;
    private String email;
    private Long hospitalId;
    private String hospitalName;
    private String designation;
}
