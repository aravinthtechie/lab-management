package com.as.labms.labtest.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public record LabTestRequestDto(

        @NotBlank(message = "Test code is required")
        @Size(max = 50)
        String testCode,

        @NotBlank(message = "Test name is required")
        @Size(max = 150)
        String testName,

        @NotNull(message = "Test category is required")
        @Positive(message = "Category ID must be positive")
        Long categoryId,

        String description,

        @NotNull(message = "Specimen type is required")
        @Positive(message = "Specimen type ID must be positive")
        Long specimenTypeId,

        @NotNull(message = "Test price is required")
        @DecimalMin(value = "0.00", message = "Price cannot be negative")
        @Digits(integer = 8, fraction = 2)
        BigDecimal price,

        @NotNull(message = "Turnaround time is required")
        @Positive(message = "Turnaround time must be greater than zero")
        Integer turnaroundTime

) {}