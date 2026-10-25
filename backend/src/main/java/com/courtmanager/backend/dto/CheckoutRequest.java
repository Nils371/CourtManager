package com.courtmanager.backend.dto;

import java.util.List;

public record CheckoutRequest(
        String checkoutMode,
        String paymentMethod,
        List<String> bookedSlots,
        ContactInfo contactInfo
) {}
