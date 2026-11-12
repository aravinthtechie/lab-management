
package com.as.labms.labtest.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record LabTestResponseDto(

        Long id,

        String testCode,

        String testName,

        Long categoryId,

        String categoryCode,

        String categoryName,

        String description,

        Long specimenTypeId,

        String specimenCode,

        String specimenName,

        BigDecimal price,

        Integer turnaroundTime,

        Boolean isActive,

        LocalDateTime createdAt,

        LocalDateTime updatedAt

) {}
