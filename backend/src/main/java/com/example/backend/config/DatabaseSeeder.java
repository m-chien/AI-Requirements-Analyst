package com.example.backend.config;

import com.example.backend.entity.User;
import com.example.backend.enums.UserRole;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    public static UUID DEFAULT_USER_ID;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User user = User.builder()
                    .email("admin@example.com")
                    .username("admin")
                    .password("hashed_password_mock")
                    .fullName("Default BA User")
                    .role(UserRole.USER)
                    .isActive(true)
                    .build();
            user = userRepository.save(user);
            DEFAULT_USER_ID = user.getId();
            System.out.println("✅ Đã tạo User mẫu thành công với ID: " + DEFAULT_USER_ID);
        } else {
            DEFAULT_USER_ID = userRepository.findAll().get(0).getId();
            System.out.println("✅ Đã lấy User mẫu có sẵn: " + DEFAULT_USER_ID);
        }
    }
}
