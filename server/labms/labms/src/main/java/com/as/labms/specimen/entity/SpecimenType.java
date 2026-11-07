
package com.as.labms.specimen.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "specimen_types",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_specimen_code",
                        columnNames = "specimen_code"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class SpecimenType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "specimen_code",
            nullable = false,
            unique = true,
            length = 30
    )
    private String specimenCode;

    @Column(
            name = "specimen_name",
            nullable = false,
            length = 100
    )
    private String specimenName;

    @Column(length = 500)
    private String description;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
