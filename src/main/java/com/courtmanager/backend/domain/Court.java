package com.courtmanager.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "courts")
public class Court {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Boolean isIndoor;

    private BigDecimal hourlyRate;

    @ManyToOne
    @JoinColumn(name = "facility_id")
    private Facility facility;
}
