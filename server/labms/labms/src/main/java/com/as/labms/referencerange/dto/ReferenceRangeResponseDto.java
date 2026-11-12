package com.as.labms.referencerange.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReferenceRangeResponseDto(

        Long id,

        Long testParameterId,
        String parameterCode,
        String parameterName,
        String unit,

        String gender,
        Integer minAge,
        Integer maxAge,

        BigDecimal minValue,
        BigDecimal maxValue,

        String interpretation,
        Boolean isActive,

        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {
}