package com.courtmanager.backend.controller;

import com.courtmanager.backend.domain.Court;
import com.courtmanager.backend.domain.Facility;
import com.courtmanager.backend.domain.User;
import com.courtmanager.backend.dto.*;
import com.courtmanager.backend.service.CourtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/courts")
@RequiredArgsConstructor

public class CourtController {
    private final CourtService courtService;

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<CourtResponse> createCourt(
            @Valid @RequestBody CreateCourtRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        Court createdCourt = courtService.createCourt(request, currentUser);

        CourtResponse courtResponse = CourtResponse.fromEntity(createdCourt);

        return new ResponseEntity<>(courtResponse, HttpStatus.CREATED);
    }

    @GetMapping("/{courtId}/availability")
    public ResponseEntity<Map<LocalDate, List<TimeSlot>>> getAvailableTimeSlotsForNextSevenDays(
            @PathVariable Long courtId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {
        Map<LocalDate, List<TimeSlot>> map = new LinkedHashMap<>();

        for(int i = 0; i < 7; i++) {
            List<TimeSlot> availableTimeSlots = courtService.getAvailableTimeSlots(courtId, startDate.plusDays(i));
            map.put(startDate.plusDays(i), availableTimeSlots);
        }

        return ResponseEntity.ok(map);
    }

    @DeleteMapping("{id}")
    @PreAuthorize("hasAnyRole('FACILITY_OWNER', 'ADMIN')")
    public ResponseEntity<Void> deleteCourt(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        courtService.deleteCourt(id, currentUser);

        return ResponseEntity.noContent().build();
    }
}
