package com.courtmanager.backend.service;

import com.courtmanager.backend.domain.*;
import com.courtmanager.backend.dto.TimeSlot;
import com.courtmanager.backend.repository.BookingRepository;
import com.courtmanager.backend.repository.CourtRepository;
import com.courtmanager.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CourtRepository courtRepository;
    private final UserRepository userRepository;

    @Value("${courtmanager.booking.slot-duration-minutes:60}")
    private int slotDurationMinutes;

    @Transactional
    public Booking createBooking(Long courtId, Long customerId, LocalDateTime startTime, LocalDateTime endTime) {

        if (!startTime.toLocalDate().equals(endTime.toLocalDate()))
            throw new IllegalArgumentException("Buchung darf nicht über mehrere Tage gehen");

        if(startTime.isBefore(LocalDateTime.now()))
            throw new IllegalArgumentException("Die Buchung muss in der Zukunft liegen");

        if(!endTime.isAfter(startTime))
            throw new IllegalArgumentException("Die Buchung muss nach der Startzeit enden");

        if(startTime.getMinute() % slotDurationMinutes != 0)
            throw new IllegalArgumentException("Die Buchung muss zur vollen Stunde starten.");

        if(startTime.getSecond()  != 0 || startTime.getNano() != 0)
            throw new IllegalArgumentException("Die Buchung muss zur vollen Stunde starten.");

        long durationMinutes = Duration.between(startTime, endTime).toMinutes();
        if(durationMinutes < 60)
            throw new IllegalArgumentException("Die Buchung muss mindestens eine Stunde lang sein");

        if(durationMinutes % slotDurationMinutes != 0)
            throw new IllegalArgumentException("Es kann nur stundenweise gebucht werden.");

        Court court = courtRepository.findById(courtId).orElseThrow(() -> new EntityNotFoundException("Diesen Court gibt es nicht"));
        User user = userRepository.findById(customerId).orElseThrow(() -> new EntityNotFoundException("Diesen User gibt es nicht"));
        Facility facility = court.getFacility();

        if(startTime.toLocalTime().isBefore(facility.getOpeningTime()) || endTime.toLocalTime().isAfter(facility.getClosingTime()))
            throw new IllegalArgumentException("Buchung muss innerhalb der Öffnungszeiten liegen");

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
    public Booking getBookingById(Long bookingId, User currentUser) {
        Booking booking =bookingRepository.findById(bookingId)
                .orElseThrow(() -> new EntityNotFoundException("Buchung mit ID " + bookingId + "wurde nicht gefunden."));


        boolean isOwner = booking.getCourt().getFacility().getOwner().getId().equals(currentUser.getId());
        boolean isCustomer = currentUser.getId().equals(booking.getCustomer().getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if(!isAdmin && !isOwner && !isCustomer) {
            throw new AccessDeniedException("Sie sind nicht berechtigt die Buchungen zu laden.");
        }

        return booking;
    }

    @Transactional(readOnly = true)
    public List<Booking> getBookingsByCourt (Long courtId, User currentUser) {
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new EntityNotFoundException("Court nicht gefunden."));

        boolean isOwner = court.getFacility().getOwner().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if(!isAdmin && !isOwner) {
            throw new AccessDeniedException("Sie sind nicht berechtigt die Buchungen zu laden.");
        }

        return bookingRepository.findByCourtId(courtId);
    }

    @Transactional(readOnly = true)
    public List<Booking> getBookingsByCustomer (Long customerId, User currentUser) {
        boolean isCustomer = currentUser.getId().equals(customerId);
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if(!isAdmin && !isCustomer) {
            throw new AccessDeniedException("Sie sind nicht berechtigt die Buchungen zu laden.");
        }

        return bookingRepository.findByCustomerId(customerId);
    }

    @Transactional
    public Booking cancelBooking(Long bookingId, User currentUser) {
        Booking booking = getBookingById(bookingId, currentUser);

        boolean isOwner = booking.getCustomer().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        boolean isFacilityOwner = booking.getCourt().getFacility().getOwner().getId().equals(currentUser.getId());

        if (!isOwner && !isAdmin && !isFacilityOwner) {
            throw new AccessDeniedException("Sie sind nicht berechtigt, diese Buchung zu stornieren.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Diese Buchung ist bereits storniert");
        }

        if (booking.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Vergangene Buchungen können nicht mehr storniert werden");
        }

        if (!isAdmin && !isFacilityOwner) {
            if(booking.getStartTime().isBefore(LocalDateTime.now().plusHours(12)))
                throw new IllegalStateException("Die Stornierungsfrist von 12 Stunden ist abgelaufen");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}
