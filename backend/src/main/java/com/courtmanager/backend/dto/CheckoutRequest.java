package com.courtmanager.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CheckoutRequest(
        String checkoutMode,
        String paymentMethod,

        @NotEmpty(message = "Es muss mindestens ein Slot gebucht werden")
        List<String> bookedSlots,

        @Valid
        ContactInfo contactInfo
) {}
