package com.as.labms.doctor.dto;

import java.time.LocalDateTime;

public record DoctorResponseDto(
        Long id,
        String doctorName,
        String registrationNumber,
        String specialization,
        String hospitalName,
        String mobileNumber,
        String email,
        Boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}