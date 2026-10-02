package com.courtmanager.backend.dto;

import com.courtmanager.backend.domain.Facility;
import java.time.LocalTime;

public record FacilityResponse(
        Long id,
        String name,
        Long ownerId,
        String ownerName,
        LocalTime openingTime,
        LocalTime closingTime,
        boolean hasChangingRoom,
        boolean hasShower,
        boolean hasSnackBar,
        boolean hasToilet
) {
    public static FacilityResponse fromEntity(Facility facility) {
        return new FacilityResponse(
                facility.getId(),
                facility.getName(),
                facility.getOwner().getId(),
                facility.getOwner().getFirstName() + " " + facility.getOwner().getLastName(),
                facility.getOpeningTime(),
                facility.getClosingTime(),
                facility.getHasChangingRoom(),
                facility.getHasShower(),
                facility.getHasSnackBar(),
                facility.getHasToilet()
        );
    }
}
