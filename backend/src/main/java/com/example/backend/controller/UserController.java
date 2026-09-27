package com.example.chien_java_template.controller;

import com.example.chien_java_template.dto.CreateUserDTO;
import com.example.chien_java_template.dto.UpdateUserDTO;
import com.example.chien_java_template.dto.UserDTO;
import com.example.chien_java_template.dto.request.GoogleLoginRequest;
import com.example.chien_java_template.dto.request.UserLoginRequest;
import com.example.chien_java_template.dto.response.AuthResponse;
import com.example.chien_java_template.exception.ApiResponse;
import com.example.chien_java_template.service.AuthService;
import com.example.chien_java_template.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final AuthService authService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody CreateUserDTO createUserDTO) {
        UserDTO userDTO = userService.createUser(createUserDTO);
        return new ResponseEntity<>(userDTO, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO userDTO = userService.getUserById(id);
        return ResponseEntity.ok(userDTO);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        UserDTO userDTO = userService.getUserByEmail(email);
        return ResponseEntity.ok(userDTO);
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserDTO> getUserByUsername(@PathVariable String username) {
        UserDTO userDTO = userService.getUserByUsername(username);
        return ResponseEntity.ok(userDTO);
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserDTO updateUserDTO) {
        UserDTO userDTO = userService.updateUser(id, updateUserDTO);
        return ResponseEntity.ok(userDTO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<Void> activateUser(@PathVariable Long id) {
        userService.activateUser(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody UserLoginRequest user,
            HttpServletResponse response) {

        AuthResponse auth = authService.login(user);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", auth.getRefreshToken())
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("Lax")
                .build();
        System.out.println("Cookie gửi về client: " + cookie.toString());
        response.setHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        System.out.println("Set-Cookie từ response header: " + response.getHeader(HttpHeaders.SET_COOKIE));

        return ResponseEntity.ok(
                AuthResponse.builder()
                        .token(auth.getToken())
                        .refreshToken(auth.getRefreshToken())
                        .user(auth.getUser())
                        .build()
        );
    }
    @PostMapping("/auth/google")
    public AuthResponse loginGoogle(@RequestBody GoogleLoginRequest request) throws Exception {
        return authService.loginWithGoogle(request.getIdToken());
    }
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestBody String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.ok("Logged out successfully");
    }
    @PostMapping("/upAva")
    public ResponseEntity<ApiResponse<String>> updateAvatar(
            @RequestParam("avatar") MultipartFile file,
            Authentication authentication) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body(ApiResponse.<String>builder()
                .code(1001)
                .message("ảnh không hợp lệ")
                .build());
        String email = authentication.getName();
        try {
            String link_ava = userService.updateAvatar(email, file);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                    .message("Cập nhật thành công avatar")
                    .result(link_ava)
                    .build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    ApiResponse.<String>builder()
                            .code(500)
                            .message("Lỗi khi cập nhật avatar: " + e.getMessage())
                            .build());
        }
    }
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
        System.out.println("gọi refresh token");
        return ResponseEntity.ok(authService.refresh(request));
    }
}

