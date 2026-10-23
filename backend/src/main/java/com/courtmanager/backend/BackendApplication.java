package com.courtmanager.backend;

import com.courtmanager.backend.domain.Role;
import com.courtmanager.backend.domain.User;
import com.courtmanager.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.password.PasswordEncoder;

@EnableAsync
@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
    CommandLineRunner initAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			if (userRepository.findByEmail("admin@test.de").isEmpty()) {
				User admin = User.builder()
						.firstName("System")
						.lastName("Admin")
						.email("admin@test.de")
						.passwordHash(passwordEncoder.encode("admin123"))
						.role(Role.ADMIN)
						.build();
				userRepository.save(admin);
				System.out.println("Admin-User wurde angelegt!");
			}
		};
	}
}
