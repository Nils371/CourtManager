package com.courtmanager.backend.repository;

import com.courtmanager.backend.domain.Court;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourtRepository extends JpaRepository<Court, Long> {
    List<Court> findByFacilityId(Long facilityId);
}
