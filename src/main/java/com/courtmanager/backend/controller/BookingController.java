package com.courtmanager.backend.controller;

import com.courtmanager.backend.domain.Booking;
import com.courtmanager.backend.dto.BookingRequest;
import com.courtmanager.backend.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody BookingRequest request) {
        Booking createdBooking = bookingService.createBooking(
                request.courtId(),
                request.customerId(),
                request.startTime(),
                request.endTime()
        );
        return new ResponseEntity<>(createdBooking, HttpStatus.CREATED);
    }
}
