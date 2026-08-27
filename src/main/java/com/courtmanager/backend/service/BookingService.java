package com.courtmanager.backend.service;

import com.courtmanager.backend.domain.*;
import com.courtmanager.backend.repository.BookingRepository;
import com.courtmanager.backend.repository.CourtRepository;
import com.courtmanager.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CourtRepository courtRepository;
    private final UserRepository userRepository;

    public Booking createBooking(Long courtId, Long customerId, LocalDateTime startTime, LocalDateTime endTime) {
        if(startTime.isBefore(LocalDateTime.now()))
            throw new IllegalArgumentException("Die Buchung muss in der Zukunft liegen");

        if(!endTime.isAfter(startTime))
            throw new IllegalArgumentException("Die Buchung muss nach der Startzeit enden");

        Court court = courtRepository.findById(courtId).orElseThrow(() -> new EntityNotFoundException("Diesen Court gibt es nicht"));
        User user = userRepository.findById(customerId).orElseThrow(() -> new EntityNotFoundException("Diesen User gibt es nicht"));

        if(bookingRepository.existsOverlappingBooking(courtId, startTime, endTime, BookingStatus.CANCELLED))
            throw new IllegalStateException("Court ist für diesen Zeitslot schon vergeben");

        long duration = Duration.between(startTime, endTime).toHours();
        BigDecimal price = court.getHourlyRate().multiply(BigDecimal.valueOf(duration));

        Booking booking = Booking.builder()
                .court(court)
                .customer(user)
                .startTime(startTime)
                .endTime(endTime)
                .status(BookingStatus.CONFIRMED)
                .isPaid(false)
                .totalPrice(price)
                .build();

        return bookingRepository.save(booking);
    }
}
