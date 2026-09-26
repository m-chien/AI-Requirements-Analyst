package com.example.chien_java_template.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserDTO {
    private String email;
    private String password;
    private String fullName;
    private String username;
    private String phoneNumber;
}

