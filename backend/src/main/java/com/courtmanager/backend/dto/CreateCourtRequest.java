package com.courtmanager.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;

public record CreateCourtRequest(
        @NotNull(message = "Die ID der Anlage (Facility) ist erforderlich")
        Long facilityId,

        @NotBlank(message = "Der Name des Courts darf nicht leer sein")
        String name,

        boolean isIndoor,

        @NotNull(message = "Der Stundenpreis ist erforderlich")
        @PositiveOrZero(message = "Der Preis darf nicht negativ sein")
        BigDecimal hourlyRate
) {}
