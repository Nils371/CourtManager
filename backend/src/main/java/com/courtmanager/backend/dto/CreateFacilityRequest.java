package com.courtmanager.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;

public record CreateFacilityRequest(
        @NotBlank(message = "Name der Anlage darf nicht leer sein")
        String name,

        @NotNull(message = "Öffnungszeit ist erforderlich")
        LocalTime openingTime,

        @NotNull(message = "Schließzeit ist erforderlich")
        LocalTime closingTime,

        boolean hasChangingRoom,
        boolean hasShower,
        boolean hasSnackBar,
        boolean hasToilet
) {}
