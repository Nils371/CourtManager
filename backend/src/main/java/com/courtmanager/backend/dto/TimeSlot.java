package com.courtmanager.backend.dto;

import java.time.LocalDateTime;

public record TimeSlot(
        LocalDateTime start,
        LocalDateTime end,
        boolean isAvailable
) {}
