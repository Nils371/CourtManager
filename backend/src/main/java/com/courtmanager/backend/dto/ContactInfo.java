package com.courtmanager.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ContactInfo(
        @NotBlank(message = "Vorname darf nicht leer sein")
        String firstName,

        @NotBlank(message = "Nachname darf nicht leer sein")
        String lastName,

        @NotBlank(message = "E-Mail darf nicht leer sein")
        String email,

        String phone
) {}
