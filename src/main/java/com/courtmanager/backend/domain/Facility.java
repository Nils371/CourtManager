package com.courtmanager.backend.domain;

import jakarta.persistence.*;
import lombok.*;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "facilities")
public class Facility {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Boolean hasShower;

    private Boolean hasToilet;

    private Boolean hasSnackBar;

    private Boolean hasChangingRoom;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;
}
