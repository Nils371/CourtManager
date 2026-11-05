package com.courtmanager.backend;

import com.courtmanager.backend.domain.*;
import com.courtmanager.backend.repository.CourtRepository;
import com.courtmanager.backend.repository.FacilityRepository;
import com.courtmanager.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FacilityRepository facilityRepository;
    private final CourtRepository courtRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if(courtRepository.count() == 0) {

            User owner = User.builder()
                    .firstName("Chef")
                    .lastName("Betreiber")
                    .email("owner@test.de")
                    .passwordHash(passwordEncoder.encode("owner123"))
                    .role(Role.OWNER)
                    .build();
            userRepository.save(owner);

            Facility facility = Facility.builder()
                    .name("Big Beach")
                    .owner(owner)
                    .hasChangingRoom(true)
                    .hasShower(true)
                    .hasSnackBar(false)
                    .hasToilet(true)
                    .closingTime(LocalTime.of(22,0))
                    .openingTime(LocalTime.of(8,0))
                    .build();
            facilityRepository.save(facility);

            Court court = Court.builder()
                    .name("Court 1")
                    .isIndoor(false)
                    .hourlyRate(new BigDecimal("25.00"))
                    .facility(facility)
                    .build();
            courtRepository.save(court);
        }
    }
}
