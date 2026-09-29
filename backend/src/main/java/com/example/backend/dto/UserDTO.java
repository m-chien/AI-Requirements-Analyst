package com.example.backend.dto;

import lombok.*;

import java.time.LocalDateTime;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private UUID id;
    private String email;
    private String fullName;
    private String username;
    private String phoneNumber;
    private String avatar;
    private String role;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;
}

