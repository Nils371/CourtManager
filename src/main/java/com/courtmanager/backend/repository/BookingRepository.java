package com.courtmanager.backend.repository;

import com.courtmanager.backend.domain.Booking;
import com.courtmanager.backend.domain.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("""
        SELECT COUNT(b) > 0 FROM Booking b
        WHERE b.court.id = :courtId
          AND b.status != :cancelledStatus
          AND b.startTime < :endTime
          AND b.endTime > :startTime
""")
    Boolean existsOverlappingBooking(
            @Param("courtId") Long courtId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("cancelledStatus") BookingStatus cancelledStatus
            );

    List<Booking> findByCourtId(Long courtId);

    List<Booking> findByCustomerId(Long customerId);

}
