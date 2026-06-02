package com.codered.dto;

import lombok.Data;

@Data
public class CreateUserRequest {
    private String name;
    private String email;
    private String password;
    private String role;
    private String designation;
    private String contactNumber;
}
