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
import java.util.List;

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
    public ResponseEntity<List<TimeSlot>> getAvailableTimeSlots(
            @PathVariable Long courtId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<TimeSlot> availableTimeSlots = courtService.getAvailableTimeSlots(courtId, date);

        return ResponseEntity.ok(availableTimeSlots);
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
