package com.courtmanager.backend.service;

import com.courtmanager.backend.domain.Facility;
import com.courtmanager.backend.domain.Role;
import com.courtmanager.backend.domain.User;
import com.courtmanager.backend.dto.CreateFacilityRequest;
import com.courtmanager.backend.repository.FacilityRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityRepository facilityRepository;

    @Transactional
    public Facility createFacility(CreateFacilityRequest request, User currentUser) {
        if(request.openingTime().isAfter(request.closingTime())) {
            throw new IllegalArgumentException("Die Öffnungszeit muss vor der Schließzeit sein.");
        }

        Facility facility = Facility.builder()
                .name(request.name())
                .hasShower(request.hasShower())
                .hasToilet(request.hasToilet())
                .hasSnackBar(request.hasSnackBar())
                .hasChangingRoom(request.hasChangingRoom())
                .openingTime(request.openingTime())
                .closingTime(request.closingTime())
                .owner(currentUser)
                .build();

        return  facilityRepository.save(facility);
    }

    @Transactional(readOnly = true)
    public Facility getFacilityById(Long id) {
        return facilityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Die Facililty mit der ID " + id + "wurde nicht gefunden."));
    }

    @Transactional(readOnly = true)
    public List<Facility> getMyFacilities(Long ownerId) {
        return facilityRepository.findByOwnerId(ownerId);
    }

    @Transactional
    public void deleteFacility(Long facilityId, User currentUser) {
        Facility facility = getFacilityById(facilityId);

        boolean isOwner = facility.getOwner().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if(!isOwner && !isAdmin) {
            throw new AccessDeniedException("Sie sind nicht berechtigt, diese Facility zu löschen");
        }

        facilityRepository.delete(facility);
    }
}
