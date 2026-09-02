package com.courtmanager.backend.controller;

import com.courtmanager.backend.domain.*;
import com.courtmanager.backend.dto.BookingRequest;
import com.courtmanager.backend.dto.TimeSlot;
import com.courtmanager.backend.service.BookingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BookingController.class)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @MockitoBean
    private BookingService bookingService;

    @Test
    void createBooking_ValidRequest_ShouldReturn201() throws Exception {
        LocalDateTime start = LocalDate.now().plusDays(1).atTime(14, 0);
        LocalDateTime end = start.plusHours(2);

        BookingRequest bookingRequest = new BookingRequest(1L, 1L, start, end);
        Booking booking = Booking.builder()
                .id(1L)
                .court(Court.builder().id(1L).name("center court").build())
                .customer(User.builder().id(1L).firstName("Max").lastName("Mustermann").build())
                .startTime(start)
                .endTime(end)
                .status(BookingStatus.CONFIRMED)
                .isPaid(false)
                .totalPrice(new BigDecimal("50.00"))
                .build();

        when(bookingService.createBooking(eq(1L),eq(1L),eq(start),eq(end))).thenReturn(booking);

        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.totalPrice").value(50.00))
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    void createBooking_InvalidRequest_ShouldReturn400() throws Exception {
        LocalDateTime start = LocalDate.now().minusDays(1).atTime(14, 0);
        LocalDateTime end = start.plusHours(2);

        BookingRequest bookingRequest = new BookingRequest(1L, 1L, start, end);

        mockMvc.perform(post("/api/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingRequest)))
                .andExpect(status().isBadRequest());

        verify(bookingService, never()).createBooking(any(), any(), any(), any());
    }

    @Test
    void cancelBooking_Success_ShouldReturn200() throws Exception {
        LocalDateTime start = LocalDate.now().plusDays(1).atTime(14, 0);
        LocalDateTime end = start.plusHours(2);

        Booking cancelledBooking = Booking.builder()
                .id(1L)
                .court(Court.builder().id(1L).name("center court").build())
                .customer(User.builder().id(1L).firstName("Max").lastName("Mustermann").build())
                .startTime(start)
                .endTime(end)
                .status(BookingStatus.CANCELLED)
                .isPaid(false)
                .totalPrice(new BigDecimal("50.00"))
                .build();

        when(bookingService.cancelBooking(eq(1L))).thenReturn(cancelledBooking);

        mockMvc.perform(patch("/api/bookings/{id}/cancel", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        verify(bookingService, times(1)).cancelBooking(1L);
    }
}