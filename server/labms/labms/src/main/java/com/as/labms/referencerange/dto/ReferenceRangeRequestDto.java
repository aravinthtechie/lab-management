package com.as.labms.referencerange.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record ReferenceRangeRequestDto(

        @NotNull(message = "Test parameter ID is required")
        @Positive(message = "Test parameter ID must be positive")
        Long testParameterId,

        @NotBlank(message = "Gender is required")
        @Pattern(
                regexp = "MALE|FEMALE|ALL",
                message = "Gender must be MALE, FEMALE or ALL"
        )
        String gender,

        @Min(value = 0, message = "Minimum age cannot be negative")
        Integer minAge,

        @Min(value = 0, message = "Maximum age cannot be negative")
        Integer maxAge,

        @NotNull(message = "Minimum value is required")
        BigDecimal minValue,

        @NotNull(message = "Maximum value is required")
        BigDecimal maxValue,

        @Size(max = 100)
        String interpretation

) {
}