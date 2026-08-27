package com.courtmanager.backend.dto;

import java.time.LocalDateTime;

public record BookingRequest(
   Long courtId,
   Long customerId,
   LocalDateTime startTime,
   LocalDateTime endTime
) {}
