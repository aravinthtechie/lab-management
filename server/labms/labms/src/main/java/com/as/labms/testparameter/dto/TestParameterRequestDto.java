package com.as.labms.testparameter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record TestParameterRequestDto(

        @NotNull(message = "Lab test ID is required")
        @Positive(message = "Lab test ID must be positive")
        Long labTestId,

        @NotBlank(message = "Parameter code is required")
        @Size(max = 50)
        String parameterCode,

        @NotBlank(message = "Parameter name is required")
        @Size(max = 150)
        String parameterName,

        @Size(max = 50)
        String unit,

        @NotBlank(message = "Data type is required")
        String dataType,

        @NotNull(message = "Display order is required")
        @Positive(message = "Display order must be positive")
        Integer displayOrder

) {
}