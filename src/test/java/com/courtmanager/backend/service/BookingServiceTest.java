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
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private CourtRepository courtRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private BookingService bookingService;

    private Court testCourt;
    private User testCustomer;
    private Facility testFacility;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(bookingService, "slotDurationMinutes", 60);

        testFacility = Facility.builder()
                .id(1L)
                .name("golden beach")
                .openingTime(LocalTime.of(8,0))
                .closingTime(LocalTime.of(8,0))
                .build();

        testCourt = Court.builder()
                .id(1L)
                .name("Center Court")
                .hourlyRate(new BigDecimal("25.00"))
                .facility(testFacility)
                .build();

        testCustomer = User.builder()
                .id(1L)
                .firstName("Max")
                .lastName("Mustermann")
                .email("max@example.com")
                .role(Role.CUSTOMER)
                .build();
    }

    @Test
    void createBooking_Success_ShouldCalculateCorrectPriceAndSave() {
        LocalDateTime start = LocalDate.now().plusDays(1).atTime(14, 0);

        LocalDateTime end = LocalDate.now().plusDays(1).atTime(16, 0);

        when(courtRepository.findById(1L)).thenReturn(Optional.of(testCourt));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(bookingRepository.existsOverlappingBooking(eq(1L), any(), any(), eq(BookingStatus.CANCELLED)))
                .thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Booking result = bookingService.createBooking(1L, 1L, start, end);

        assertNotNull(result);
        assertEquals(0, new BigDecimal("50.00").compareTo(result.getTotalPrice()));
        verify(bookingRepository, times(1)).save(any());
    }

    @Test
    void createBooking_Overlap_ShouldThrowException() {
        LocalDateTime start = LocalDate.now().plusDays(1).atTime(14, 0);

        LocalDateTime end = LocalDate.now().plusDays(1).atTime(16, 0);

        when(courtRepository.findById(1L)).thenReturn(Optional.of(testCourt));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(bookingRepository.existsOverlappingBooking(eq(1L), any(), any(), eq(BookingStatus.CANCELLED)))
                .thenReturn(true);

        assertThrows(IllegalStateException.class, () ->
                bookingService.createBooking(1L, 1L, start, end)
        );

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_NotBookedAtStartOfHour_ShouldThrowException() {
        LocalDateTime start = LocalDate.now().plusDays(1).atTime(14, 30);
        LocalDateTime end = LocalDate.now().plusDays(1).atTime(16, 30);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                bookingService.createBooking(1L, 1L, start, end)
        );

        when(courtRepository.findById(1L)).thenReturn(Optional.of(testCourt));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testCustomer));

        assertEquals("Die Buchung muss zur vollen Stunde starten.", exception.getMessage());

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void createBooking_NotBookedDuringOpeningTimes_ShouldThrowException() {
        LocalDateTime start = LocalDate.now().plusDays(1).atTime(6, 0);
        LocalDateTime end = LocalDate.now().plusDays(1).atTime(8, 0);

        when(courtRepository.findById(1L)).thenReturn(Optional.of(testCourt));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testCustomer));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                bookingService.createBooking(1L, 1L, start, end)
        );

        assertEquals("Buchung muss innerhalb der Öffnungszeiten liegen", exception.getMessage());

        verify(bookingRepository, never()).save(any());
    }

    @Test
    void cancelBooking_Success_ShouldSetStatusToCancelled() {
        Booking testBooking = Booking.builder()
                .id(1L)
                .court(testCourt)
                .customer(testCustomer)
                .startTime(LocalDateTime.now().plusDays(2)) // 48h in der Zukunft
                .endTime(LocalDateTime.now().plusDays(2).plusHours(2))
                .totalPrice(new BigDecimal("50.00"))
                .status(BookingStatus.CONFIRMED)
                .isPaid(false)
                .build();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

         Booking cancelledBooking = bookingService.cancelBooking(1L);

         assertEquals(BookingStatus.CANCELLED, cancelledBooking.getStatus());
         verify(bookingRepository, times(1)).save(testBooking);
    }

    @Test
    void cancelBooking_TooLate_ShouldThrowException() {
        Booking testBooking = Booking.builder()
                .id(1L)
                .court(testCourt)
                .customer(testCustomer)
                .startTime(LocalDateTime.now().plusHours(2)) //
                .endTime(LocalDateTime.now().plusHours(4))
                .totalPrice(new BigDecimal("50.00"))
                .status(BookingStatus.CONFIRMED)
                .isPaid(false)
                .build();

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));

        assertThrows(IllegalStateException.class, () ->
                bookingService.cancelBooking(1L)
        );
        verify(bookingRepository, never()).save(testBooking);
    }
}