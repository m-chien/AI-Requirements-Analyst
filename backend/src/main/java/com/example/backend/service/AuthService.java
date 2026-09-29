package com.example.backend.service;

import com.example.backend.dto.request.UserLoginRequest;
import com.example.backend.dto.response.AuthResponse;
import com.example.backend.enums.AuthProvider;
import com.example.backend.enums.UserRole;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.UserMapper;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final GoogleTokenVerifier verifier;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(UserLoginRequest request) {
        // Kiểm tra email có tồn tại không
        User existingUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Kiểm tra mật khẩu
        if (!passwordEncoder.matches(request.getPassword(), existingUser.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        // Kiểm tra tài khoản có hoạt động không
        if (!existingUser.getIsActive()) {
            throw new AppException(ErrorCode.ACCOUNT_INACTIVE);
        }

        // Tạo access token
        String accessToken = jwtService.createToken(existingUser);

        // Tạo refresh token
        String refreshToken = jwtService.createRefreshToken(existingUser);
        log.debug("Refresh token created for user: {}", existingUser.getId());

        // Lưu refresh token vào Redis
        jwtService.saveRefreshToken(refreshToken, existingUser.getId().toString());

        // Cập nhật thời gian đăng nhập cuối cùng
        userRepository.updateLastLoginTime(existingUser.getId());

        return AuthResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toDTO(existingUser))
                .build();
    }

    public AuthResponse loginWithGoogle(String idToken) throws Exception {
        GoogleIdToken.Payload payload = verifier.verify(idToken);

        // Kiểm tra email đã được xác thực
        if (!payload.getEmailVerified()) {
            throw new AppException(ErrorCode.INVALID_INPUT);
        }

        String googleId = payload.getSubject(); // sub
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        // Tìm user theo providerId và provider
        User user = userRepository.findByProviderIdAndProvider(googleId, AuthProvider.GOOGLE.name());

        if (user == null) {
            // Kiểm tra xem email đã được đăng ký chưa
            user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                // Tạo user mới
                user = User.builder()
                        .email(email)
                        .fullName(name)
                        .avatar(picture)
                        .provider(AuthProvider.GOOGLE.name())
                        .providerId(googleId)
                        .isActive(true)
                        .role(UserRole.USER)
                        .build();
                user = userRepository.save(user);
                log.info("New user created from Google: {}", email);
            } else {
                // Cập nhật user hiện có với provider thông tin
                user.setProvider(AuthProvider.GOOGLE.name());
                user.setProviderId(googleId);
                user = userRepository.save(user);
                log.info("User updated with Google provider: {}", email);
            }
        }

        // Kiểm tra tài khoản có hoạt động không
        if (!user.getIsActive()) {
            throw new AppException(ErrorCode.ACCOUNT_INACTIVE);
        }

        // Tạo tokens
        String token = jwtService.createToken(user);
        String refreshToken = jwtService.createRefreshToken(user);
        jwtService.saveRefreshToken(refreshToken, user.getId().toString());

        // Cập nhật thời gian đăng nhập
        userRepository.updateLastLoginTime(user.getId());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .user(userMapper.toDTO(user))
                .build();
    }

    public void logout(String refreshToken) {
        jwtService.logout(refreshToken);
        log.info("User logged out successfully");
    }

    public AuthResponse refresh(HttpServletRequest request) {
        String refreshToken = extractRefreshTokenFromCookie(request);

        if (refreshToken == null) {
            log.warn("Refresh token not found in cookie");
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        String newAccessToken = jwtService.refreshAccessToken(refreshToken);
        log.debug("Access token refreshed successfully");

        return AuthResponse.builder()
                .token(newAccessToken)
                .refreshToken(refreshToken)
                .build();
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }

        for (Cookie cookie : request.getCookies()) {
            if ("refreshToken".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
