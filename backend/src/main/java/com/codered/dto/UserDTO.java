package com.codered.dto;

import com.codered.model.User;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String designation;
    private String contactNumber;

    public static UserDTO from(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setDesignation(user.getDesignation());
        dto.setContactNumber(user.getContactNumber());
        return dto;
    }
}
