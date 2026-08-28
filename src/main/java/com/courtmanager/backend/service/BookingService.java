package com.courtmanager.backend.service;

import com.courtmanager.backend.domain.*;
import com.courtmanager.backend.repository.BookingRepository;
import com.courtmanager.backend.repository.CourtRepository;
import com.courtmanager.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CourtRepository courtRepository;
    private final UserRepository userRepository;

    @Transactional
    public Booking createBooking(Long courtId, Long customerId, LocalDateTime startTime, LocalDateTime endTime) {

        if(startTime.isBefore(LocalDateTime.now()))
            throw new IllegalArgumentException("Die Buchung muss in der Zukunft liegen");

        if(!endTime.isAfter(startTime))
            throw new IllegalArgumentException("Die Buchung muss nach der Startzeit enden");

        long durationMinutes = Duration.between(startTime, endTime).toMinutes();
        if(durationMinutes < 60)
            throw new IllegalArgumentException("Die Buchung muss mindestens eine Stunde lang sein");

        Court court = courtRepository.findById(courtId).orElseThrow(() -> new EntityNotFoundException("Diesen Court gibt es nicht"));
        User user = userRepository.findById(customerId).orElseThrow(() -> new EntityNotFoundException("Diesen User gibt es nicht"));

        if(bookingRepository.existsOverlappingBooking(courtId, startTime, endTime, BookingStatus.CANCELLED))
            throw new IllegalStateException("Court ist für diesen Zeitslot schon vergeben");

        BigDecimal hours = BigDecimal.valueOf(durationMinutes)
                .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        BigDecimal price = court.getHourlyRate().multiply(hours);

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

    @Transactional(readOnly = true)
    public Booking getBookingById(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Buchung mit ID " + bookingId + "wurde nicht gefunden."));

    }

    @Transactional(readOnly = true)
    public List<Booking> getBookingsByCourt (Long courtId) {
        return bookingRepository.findByCourtId(courtId);
    }

    @Transactional(readOnly = true)
    public List<Booking> getBookingsByCustomer (Long customerId) {
        return bookingRepository.findByCustomerId(customerId);
    }

    @Transactional
    public Booking cancelBooking(Long bookingId) {
        Booking booking = getBookingById(bookingId);

        if(booking.getStartTime().isBefore(LocalDateTime.now().plusHours(12)))
            throw new IllegalStateException("Die Stornierungsfrist von 12 Stunden ist abgelaufen");

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Diese Buchung ist bereits storniert");
        }

        if (booking.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Vergangene Buchungen können nicht mehr storniert werden");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
