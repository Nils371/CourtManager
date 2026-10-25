package com.courtmanager.backend.dto;

public record ContactInfo(
        String firstName,
        String lastName,
        String email,
        String phone,
        String password
) {}
