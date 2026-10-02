package com.courtmanager.backend.controller;

import com.courtmanager.backend.domain.Facility;
import com.courtmanager.backend.domain.User;
import com.courtmanager.backend.dto.CreateFacilityRequest;
import com.courtmanager.backend.dto.FacilityResponse;
import com.courtmanager.backend.service.FacilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/facilities")
@RequiredArgsConstructor
public class FacilityController {

    private final FacilityService facilityService;

    @PostMapping
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<FacilityResponse> createFacility(
            @Valid @RequestBody CreateFacilityRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        Facility createdFacility = facilityService.createFacility(request, currentUser);

        FacilityResponse facilityResponse = FacilityResponse.fromEntity(createdFacility);
        return new ResponseEntity<>(facilityResponse, HttpStatus.CREATED);
    }

    @GetMapping("/facility/{facilityId}")
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    public ResponseEntity<FacilityResponse> getFacilityById(@PathVariable Long id) {
        Facility facility = facilityService.getFacilityById(id);

        FacilityResponse facilityResponse = FacilityResponse.fromEntity(facility);

        return ResponseEntity.ok(facilityResponse);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('FACILITY_OWNER', 'ADMIN')")
    public ResponseEntity<List<FacilityResponse>> getMyFacilities(@AuthenticationPrincipal User currentUser) {
        List<Facility> facilities = facilityService.getMyFacilities(currentUser.getId());

        List<FacilityResponse> responseList = facilities.stream()
                .map(FacilityResponse::fromEntity)
                .toList();

        return ResponseEntity.ok(responseList);
    }

    @DeleteMapping("{id}")
    @PreAuthorize("hasAnyRole('FACILITY_OWNER', 'ADMIN')")
    public ResponseEntity<Void> deleteFacility(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser
    ) {
        facilityService.deleteFacility(id, currentUser);

        return ResponseEntity.noContent().build();
    }
}
