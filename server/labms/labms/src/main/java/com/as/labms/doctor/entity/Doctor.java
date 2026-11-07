package com.as.labms.doctor.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "doctors",
        indexes = {
                @Index(name = "idx_doctor_name", columnList = "doctor_name"),
                @Index(name = "idx_doctor_specialization", columnList = "specialization")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class Doctor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_name", nullable = false, length = 150)
    private String doctorName;

    @Column(name = "registration_number",
            nullable = false, unique = true, length = 100)
    private String registrationNumber;

    @Column(name = "specialization", length = 150)
    private String specialization;

    @Column(name = "hospital_name", length = 200)
    private String hospitalName;

    @Column(name = "mobile_number", length = 20)
    private String mobileNumber;

    @Column(length = 150)
    private String email;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {

        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (isActive == null) {
            isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}