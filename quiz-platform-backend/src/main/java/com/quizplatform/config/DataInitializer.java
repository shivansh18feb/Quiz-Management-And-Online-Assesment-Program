package com.quizplatform.config;

import com.quizplatform.entity.Category;
import com.quizplatform.entity.User;
import com.quizplatform.enums.Role;
import com.quizplatform.repository.CategoryRepository;
import com.quizplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        log.info("Running DataInitializer...");

        if (!userRepository.existsByEmail("admin@quizplatform.com")) {
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("User")
                    .email("admin@quizplatform.com")
                    .password(passwordEncoder.encode("Admin@123"))
                    .role(Role.ROLE_ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Created default admin user.");
        }

        if (categoryRepository.count() == 0) {
            List<Category> categories = List.of(
                    Category.builder().name("Java").description("Java programming concepts").build(),
                    Category.builder().name("Python").description("Python programming concepts").build(),
                    Category.builder().name("JavaScript").description("JS programming concepts").build(),
                    Category.builder().name("Data Structures").description("Data Structures and Algorithms").build(),
                    Category.builder().name("General Knowledge").description("General Knowledge").build()
            );
            categoryRepository.saveAll(categories);
            log.info("Created default categories.");
        }
    }
}
