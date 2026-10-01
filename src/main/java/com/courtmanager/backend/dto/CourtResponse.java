package com.courtmanager.backend.dto;

import com.courtmanager.backend.domain.Court;
import java.math.BigDecimal;

public record CourtResponse(
        Long id,
        String name,
        Boolean isIndoor,
        BigDecimal hourlyRate,
        Long facilityId,
        String facilityName
) {
    public static CourtResponse fromEntity(Court court) {
        return new CourtResponse(
                court.getId(),
                court.getName(),
                court.getIsIndoor(),
                court.getHourlyRate(),
                court.getFacility().getId(),
                court.getFacility().getName()
        );
    }
}
