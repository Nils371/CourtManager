package com.courtmanager.backend.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public record BookingRequest(
   @NotNull(message = "Court ID darf nicht leer sein")
   @Positive(message = "Court ID muss positiv sein.")
   Long courtId,

   @NotNull(message = "Startzeit darf nicht leer sein.")
   @Future(message = "Startzeit muss in der Zukunft liegen.")
   LocalDateTime startTime,

   @NotNull(message = "Endzeit darf nicht leer sein.")
   @Future(message = "Endzeit muss in der Zukunft liegen.")
   LocalDateTime endTime
) {}
