package com.as.labms.sampledispatch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record SampleDispatchRequestDto(

        @NotNull(message = "Sample collection ID is required")
        @Positive(message = "Sample collection ID must be positive")
        Long sampleCollectionId,

        @NotBlank(message = "Dispatched by is required")
        @Size(max = 100)
        String dispatchedBy,

        @NotBlank(message = "Destination is required")
        @Size(max = 150)
        String destination,

        LocalDateTime dispatchDateTime,

        @Size(max = 50)
        String transportCondition,

        String notes
) {}