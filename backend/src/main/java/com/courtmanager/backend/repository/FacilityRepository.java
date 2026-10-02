package com.courtmanager.backend.repository;

import com.courtmanager.backend.domain.Facility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepository extends JpaRepository<Facility, Long> {
    List<Facility> findByOwnerId(Long ownerId);
}
