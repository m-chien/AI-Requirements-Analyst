package com.example.backend.dto.response;

import com.example.backend.dto.UserDTO;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder(toBuilder = true)
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@AllArgsConstructor(access = AccessLevel.PUBLIC)
public class AuthResponse  {
    String token;
    String refreshToken;
    UserDTO user;
}
