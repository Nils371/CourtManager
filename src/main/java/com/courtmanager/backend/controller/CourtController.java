package com.courtmanager.backend.controller;

import com.courtmanager.backend.dto.TimeSlot;
import com.courtmanager.backend.service.CourtService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/courts")
@RequiredArgsConstructor

public class CourtController {
    private final CourtService courtService;

    @GetMapping("/{courtId}/availability")
    public ResponseEntity<List<TimeSlot>> getAvailableTimeSlots(
            @PathVariable Long courtId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<TimeSlot> availableTimeSlots = courtService.getAvailableTimeSlots(courtId, date);

        return ResponseEntity.ok(availableTimeSlots);
    }
}
