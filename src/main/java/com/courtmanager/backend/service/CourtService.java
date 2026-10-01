package com.courtmanager.backend.service;

import com.courtmanager.backend.domain.*;
import com.courtmanager.backend.dto.CreateCourtRequest;
import com.courtmanager.backend.dto.CreateFacilityRequest;
import com.courtmanager.backend.dto.TimeSlot;
import com.courtmanager.backend.repository.BookingRepository;
import com.courtmanager.backend.repository.CourtRepository;
import com.courtmanager.backend.repository.FacilityRepository;
import com.courtmanager.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
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
    private final FacilityRepository facilityRepository;

    @Value("${courtmanager.booking.slot-duration-minutes:60}")
    private int slotDurationMinutes;

    @Transactional
    public Court createCourt(CreateCourtRequest request, User currentUser) {
        Facility facility = facilityRepository.findById(request.facilityId())
                .orElseThrow(() -> new EntityNotFoundException("Facility nicht gefunden"));

        boolean isOwner = facility.getOwner().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if(!isAdmin && !isOwner) { throw new AccessDeniedException("Sie sind nicht berechtigt, einen Court zu erstellen."); }

        Court court = Court.builder()
                .name(request.name())
                .isIndoor(request.isIndoor())
                .hourlyRate(request.hourlyRate())
                .facility(facility)
                .build();

        return  courtRepository.save(court);
    }

    @Transactional(readOnly = true)
    public Court getCourtById(Long id) {
        return courtRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Der Court mit der ID " + id + " wurde nicht gefunden."));
    }

    @Transactional
    public void deleteCourt(Long courtId, User currentUser) {
        Court court = getCourtById(courtId);

        boolean isOwner = court.getFacility().getOwner().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;
        if(!isAdmin && !isOwner) { throw new AccessDeniedException("Sie sind nicht berechtigt, einen Court zu löschen."); }

        courtRepository.delete(court);
    }


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

