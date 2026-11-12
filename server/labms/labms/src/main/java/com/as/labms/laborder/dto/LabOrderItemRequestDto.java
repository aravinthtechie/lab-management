
package com.as.labms.laborder.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record LabOrderItemRequestDto(

        @NotNull(message = "Lab test ID is required")
        @Positive(message = "Lab test ID must be positive")
        Long labTestId

) {}
