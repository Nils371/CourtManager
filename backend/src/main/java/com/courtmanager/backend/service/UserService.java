package com.courtmanager.backend.service;

import com.courtmanager.backend.domain.User;
import com.courtmanager.backend.dto.UpdatePasswordRequest;
import com.courtmanager.backend.dto.UpdateProfileRequest;
import com.courtmanager.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User updateProfile(User currentUser, UpdateProfileRequest request) {
        currentUser.setFirstName(request.firstName());
        currentUser.setLastName(request.lastName());
        currentUser.setPhone(request.phone());

        return userRepository.save(currentUser);
    }

    @Transactional
    public void updatePassword(User currentUser, UpdatePasswordRequest request) {
        if(!passwordEncoder.matches(request.oldPassword(), currentUser.getPasswordHash())) {
            throw new IllegalArgumentException("Das alte Passwort ist nicht korrekt");
        }

        if (passwordEncoder.matches(request.newPassword(), currentUser.getPasswordHash())) {
            throw new IllegalArgumentException("Das neue Passwort darf nicht identisch mit dem alten sein.");
        }

        currentUser.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(currentUser);
    }
}
