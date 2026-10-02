package com.courtmanager.backend.dto;

import com.courtmanager.backend.domain.Booking;
import com.courtmanager.backend.domain.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookingResponse(
        Long id,
        Long courtId,
        String courtName,
        Long customerId,
        String customerName,
        LocalDateTime startTime,
        LocalDateTime endTime,
        BigDecimal totalPrice,
        BookingStatus status,
        boolean isPaid
) {
    public static BookingResponse fromEntity(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getCourt().getId(),
                booking.getCourt().getName(),
                booking.getCustomer().getId(),
                booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getTotalPrice(),
                booking.getStatus(),
                booking.getIsPaid()
        );
    }
}
