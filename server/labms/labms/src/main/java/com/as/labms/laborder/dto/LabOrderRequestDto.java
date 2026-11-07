package com.as.labms.laborder.dto;

import com.as.labms.laborder.entity.OrderPriority;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public record LabOrderRequestDto(

        @NotNull(message = "Patient ID is required")
        @Positive(message = "Patient ID must be positive")
        Long patientId,

        Long doctorId,

        OrderPriority priority,

        @NotEmpty(message = "Select at least one lab test")
        List<
                @NotNull(message = "Test ID cannot be null")
                @Positive(message = "Test ID must be positive")
                        Long
                > testIds,

        @DecimalMin(
                value = "0.00",
                message = "Discount cannot be negative"
        )
        @Digits(integer = 8, fraction = 2)
        BigDecimal discountAmount,

        String notes
) {
}