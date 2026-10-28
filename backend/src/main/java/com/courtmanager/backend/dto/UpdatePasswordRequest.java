package com.courtmanager.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdatePasswordRequest(
        @NotBlank(message = "Das alte Passwort muss angegeben werden")
        String oldPassword,

        @NotBlank(message = "Das neue Passwort darf nicht leer sein")
        @Size(min = 8, message = "Das neue Passwort muss mindestens 8 Zeichen lang sein")
        String newPassword
) {}
