package com.as.labms.labresult.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record LabResultRequestDto(

        @NotNull(message = "Order item ID is required")
        @Positive(message = "Order item ID must be positive")
        Long orderItemId,

        @NotNull(message = "Test parameter ID is required")
        @Positive(message = "Test parameter ID must be positive")
        Long testParameterId,

        @NotBlank(message = "Result value is required")
        @Size(max = 100)
        String resultValue,

        @Size(max = 50)
        String unit,

        @Size(max = 500)
        String remarks,

        @NotBlank(message = "Entered by is required")
        @Size(max = 100)
        String enteredBy
) {}