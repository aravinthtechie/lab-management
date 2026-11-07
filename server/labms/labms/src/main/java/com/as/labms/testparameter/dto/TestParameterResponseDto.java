package com.as.labms.testparameter.dto;

import java.time.LocalDateTime;

public record TestParameterResponseDto(

        Long id,
        Long labTestId,
        String testCode,
        String testName,
        String parameterCode,
        String parameterName,
        String unit,
        String dataType,
        Integer displayOrder,
        Boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt

) {
}