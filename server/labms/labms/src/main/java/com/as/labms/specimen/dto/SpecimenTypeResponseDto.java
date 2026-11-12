
package com.as.labms.specimen.dto;

import java.time.LocalDateTime;

public record SpecimenTypeResponseDto(
        Long id,
        String specimenCode,
        String specimenName,
        String description,
        boolean active,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
