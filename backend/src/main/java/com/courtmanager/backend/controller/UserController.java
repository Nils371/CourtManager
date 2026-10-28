package com.courtmanager.backend.controller;

import com.courtmanager.backend.domain.User;
import com.courtmanager.backend.dto.UpdatePasswordRequest;
import com.courtmanager.backend.dto.UpdateProfileRequest;
import com.courtmanager.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        Map<String, String> userData = new HashMap<>();
        userData.put("firstName", currentUser.getFirstName());
        userData.put("lastName", currentUser.getLastName());
        userData.put("email", currentUser.getEmail());
        userData.put("phone", currentUser.getPhone());

        return ResponseEntity.ok(userData);
    }

    @PutMapping("/me")
    public ResponseEntity<Map<String, String>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        User updatedUser = userService.updateProfile(currentUser, request);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Profil erfolgreich aktualisiert");
        response.put("firstName", updatedUser.getFirstName());
        response.put("lastName", updatedUser.getLastName());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> updatePassword(
            @Valid @RequestBody UpdatePasswordRequest request,
            @AuthenticationPrincipal User currentUser
    ){
        userService.updatePassword(currentUser, request);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Passwort erfolgreich geändert");

        return ResponseEntity.ok(response);
    }
}
