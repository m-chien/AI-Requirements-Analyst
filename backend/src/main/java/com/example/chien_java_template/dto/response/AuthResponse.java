package com.example.chien_java_template.dto.response;

import com.example.chien_java_template.dto.UserDTO;
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
