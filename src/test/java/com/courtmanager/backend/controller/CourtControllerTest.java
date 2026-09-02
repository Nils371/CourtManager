package com.courtmanager.backend.controller;

import com.courtmanager.backend.dto.TimeSlot;
import com.courtmanager.backend.service.BookingService;
import com.courtmanager.backend.service.CourtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CourtController.class)
class CourtControllerTest {
    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @MockitoBean
    private CourtService courtService;

    @Test
    void getAvailableTimeSlots_Success_ShouldReturn200() throws Exception {
        LocalDate date = LocalDate.of(2030,9,1);

        LocalDateTime slot1Start = LocalDateTime.of(date, LocalTime.of(8,0));
        LocalDateTime slot1End = LocalDateTime.of(date, LocalTime.of(9,0));
        LocalDateTime slot2End = LocalDateTime.of(date, LocalTime.of(10,0));


        List<TimeSlot> availableSlots = List.of(
                new TimeSlot(slot1Start, slot1End, true),
                new TimeSlot(slot1End, slot2End, false)
        );

        when(courtService.getAvailableTimeSlots(1L,date)).thenReturn(availableSlots);

        mockMvc.perform(get("/api/courts/{courtId}/availability", 1L).param("date", "2030-09-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].isAvailable").value(true))
                .andExpect(jsonPath("$[0].start").exists());
    }

    @Test
    void getAvailableTimeSlots_MissingDateParam_ShouldReturn400() throws Exception {
        mockMvc.perform(get("/api/courts/{courtId}/availability", 1L))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getAvailableTimeSlots_InvalidDateFormat_ShouldReturn400() throws Exception {
        mockMvc.perform(get("/api/courts/{courtId}/availability", 1L)
                        .param("date", "not-a-date"))
                .andExpect(status().isBadRequest());
    }
}