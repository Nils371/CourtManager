package com.courtmanager.backend.service;

import com.courtmanager.backend.domain.*;
import com.courtmanager.backend.dto.TimeSlot;
import com.courtmanager.backend.repository.BookingRepository;
import com.courtmanager.backend.repository.CourtRepository;
import com.courtmanager.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CourtService {

    private final BookingRepository bookingRepository;
    private final CourtRepository courtRepository;
    private final UserRepository userRepository;

    @Value("${courtmanager.booking.slot-duration-minutes:60}")
    private int slotDurationMinutes;

    @Transactional(readOnly = true)
    public List<TimeSlot> getAvailableTimeSlots (Long courtId, LocalDate date) {
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new EntityNotFoundException("Diesen Court gibt es nicht"));

        Facility facility = court.getFacility();

        LocalDateTime dayStart = LocalDateTime.of(date, facility.getOpeningTime());
        LocalDateTime dayEnd = LocalDateTime.of(date, facility.getClosingTime());

        LocalDateTime currentStart = dayStart;

        List<Booking> dayBookings = bookingRepository.findByCourtIdAndDateRange(
                courtId,
                dayStart,
                dayEnd,
                BookingStatus.CANCELLED
        );

        List<TimeSlot> slots = new ArrayList<>();

        while (!currentStart.plusMinutes(slotDurationMinutes).isAfter(dayEnd)) {
            LocalDateTime slotStart = currentStart;
            LocalDateTime slotEnd = currentStart.plusMinutes(slotDurationMinutes);

            boolean hasOverlap = dayBookings.stream().anyMatch(booking ->
                    booking.getStartTime().isBefore(slotEnd) &&
                            booking.getEndTime().isAfter(slotStart)
            );

            slots.add(new TimeSlot(slotStart, slotEnd, !hasOverlap));

            currentStart = slotEnd;
        }

        return slots;
    }
}

