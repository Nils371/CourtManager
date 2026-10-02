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
import org.springframework.security.access.prepost.PreAuthorize;
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
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN', 'CUSTOMER')")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        Booking booking = bookingService.getBookingById(id, currentUser);

        BookingResponse bookingResponse = BookingResponse.fromEntity(booking);

        return ResponseEntity.ok(bookingResponse);
    }

    @GetMapping("/court/{courtId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<List<BookingResponse>> getBookingsByCourt(
            @PathVariable Long courtId,
            @AuthenticationPrincipal User currentUser) {
        List<Booking> bookings = bookingService.getBookingsByCourt(courtId, currentUser);
        List<BookingResponse> responseList = bookings.stream()
                .map(BookingResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BookingResponse>> getBookingsByCustomer(
            @PathVariable Long customerId,
            @AuthenticationPrincipal User currentUser) {
        List<Booking> bookings = bookingService.getBookingsByCustomer(customerId, currentUser);
        List<BookingResponse> responseList = bookings.stream()
                .map(BookingResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(responseList);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        Booking booking = bookingService.cancelBooking(id, currentUser);

        BookingResponse bookingResponse = BookingResponse.fromEntity(booking);

        return ResponseEntity.ok(bookingResponse);
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal User currentUser) {
        List<Booking> bookings = bookingService.getBookingsByCustomer(currentUser.getId(), currentUser);

        List<BookingResponse> responseList = bookings.stream()
                .map(BookingResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(responseList);
    }
}
