package com.courtmanager.backend.controller;

import com.courtmanager.backend.domain.Booking;
import com.courtmanager.backend.domain.User;
import com.courtmanager.backend.dto.BookingRequest;
import com.courtmanager.backend.dto.BookingResponse;
import com.courtmanager.backend.dto.TimeSlot;
import com.courtmanager.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        Booking createdBooking = bookingService.createBooking(
                request.courtId(),
                currentUser.getId(),
                request.startTime(),
                request.endTime()
        );

        BookingResponse bookingResponse = BookingResponse.fromEntity(createdBooking);
        return new ResponseEntity<>(bookingResponse, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        Booking booking = bookingService.getBookingById(id);

        BookingResponse bookingResponse = BookingResponse.fromEntity(booking);

        return ResponseEntity.ok(bookingResponse);
    }

    @GetMapping("/court/{courtId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByCourt(@PathVariable Long courtId) {
        List<Booking> bookings = bookingService.getBookingsByCourt(courtId);
        List<BookingResponse> responseList = bookings.stream()
                .map(BookingResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<BookingResponse>> getBookingsByCustomer(@PathVariable Long customerId) {
        List<Booking> bookings = bookingService.getBookingsByCustomer(customerId);
        List<BookingResponse> responseList = bookings.stream()
                .map(BookingResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(responseList);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable Long id) {
        Booking booking = bookingService.cancelBooking(id);

        BookingResponse bookingResponse = BookingResponse.fromEntity(booking);

        return ResponseEntity.ok(bookingResponse);
    }
}
