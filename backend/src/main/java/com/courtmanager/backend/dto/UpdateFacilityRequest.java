package com.courtmanager.backend.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalTime;

public record UpdateFacilityRequest(
        @NotBlank(message = "Name darf nicht leer sein")
        String name,

        LocalTime openingTime,

        LocalTime closingTime,

        Boolean hasShower,

        Boolean hasToilet,

        Boolean hasSnackBar,

        Boolean hasChangingRoom
) {}
