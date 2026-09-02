package com.courtmanager.backend.service;

import com.courtmanager.backend.domain.*;
import com.courtmanager.backend.dto.TimeSlot;
import com.courtmanager.backend.repository.BookingRepository;
import com.courtmanager.backend.repository.CourtRepository;
import com.courtmanager.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CourtServiceTest {
    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private CourtRepository courtRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CourtService courtService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(courtService, "slotDurationMinutes", 60);
    }

    @Test
    void getAvailableTimeSlots_Success_EmptyDay_ShouldReturnOnlyAvailableSlots() {
        Facility facility = Facility.builder()
                .id(1L)
                .name("Golden Beach")
                .hasShower(true)
                .hasToilet(true)
                .hasSnackBar(true)
                .hasChangingRoom(true)
                .openingTime(LocalTime.of(8,0))
                .closingTime(LocalTime.of(10,0))
                .build();

        Court court = Court.builder()
                .id(1L)
                .name("center court")
                .isIndoor(false)
                .hourlyRate(new BigDecimal("25.00"))
                .facility(facility)
                .build();

        LocalDate date = LocalDate.of(2030,9,1);
        LocalDateTime dayStart = LocalDateTime.of(date, facility.getOpeningTime());
        LocalDateTime dayEnd = LocalDateTime.of(date, facility.getClosingTime());

        List<Booking> bookings = new ArrayList<>();

        when(courtRepository.findById(1L)).thenReturn(Optional.of(court));
        when(bookingRepository.findByCourtIdAndDateRange(1L, dayStart, dayEnd, BookingStatus.CANCELLED))
                .thenReturn(bookings);

        List<TimeSlot> availableSlots = courtService.getAvailableTimeSlots(1L, date);

        assertEquals(2, availableSlots.size());
        assertTrue(availableSlots.getFirst().isAvailable());
        assertTrue(availableSlots.getLast().isAvailable());

        verify(courtRepository, times(1)).findById(1L);
        verify(bookingRepository, times(1))
                .findByCourtIdAndDateRange(1L, dayStart, dayEnd, BookingStatus.CANCELLED);
    }

    @Test
    void getAvailableTimeSlots_Success_OneSlotBooked_ShouldReturnSlotsWithFirstUnavailable() {
        Facility facility = Facility.builder()
                .id(1L)
                .name("Golden Beach")
                .hasShower(true)
                .hasToilet(true)
                .hasSnackBar(true)
                .hasChangingRoom(true)
                .openingTime(LocalTime.of(8,0))
                .closingTime(LocalTime.of(10,0))
                .build();

        Court court = Court.builder()
                .id(1L)
                .name("center court")
                .isIndoor(false)
                .hourlyRate(new BigDecimal("25.00"))
                .facility(facility)
                .build();

        LocalDate date = LocalDate.of(2030,9,1);
        LocalDateTime dayStart = LocalDateTime.of(date, facility.getOpeningTime());
        LocalDateTime dayEnd = LocalDateTime.of(date, facility.getClosingTime());

        Booking booking = Booking.builder()
                .id(1L)
                .court(court)
                .startTime(LocalDateTime.of(date, LocalTime.of(8,0)))
                .endTime(LocalDateTime.of(date, LocalTime.of(9,0)))
                .status(BookingStatus.CONFIRMED)
                .isPaid(false)
                .totalPrice(new BigDecimal("50.00"))
                .build();

        List<Booking> bookings = new ArrayList<>();
        bookings.add(booking);

        when(courtRepository.findById(1L)).thenReturn(Optional.of(court));
        when(bookingRepository.findByCourtIdAndDateRange(1L, dayStart, dayEnd, BookingStatus.CANCELLED))
                .thenReturn(bookings);

        List<TimeSlot> availableSlots = courtService.getAvailableTimeSlots(1L, date);

        assertEquals(2, availableSlots.size());
        assertFalse(availableSlots.getFirst().isAvailable());
        assertTrue(availableSlots.getLast().isAvailable());

        verify(courtRepository, times(1)).findById(1L);
        verify(bookingRepository, times(1))
                .findByCourtIdAndDateRange(1L, dayStart, dayEnd, BookingStatus.CANCELLED);
    }
}