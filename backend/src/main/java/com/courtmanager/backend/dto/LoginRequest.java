package com.courtmanager.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "E-Mail darf nicht leer sein")
        @Email(message = "Ungültiges E-Mail-Format")
        String email,

        @NotBlank(message = "Passwort darf nicht leer sein")
        String password
) {}
