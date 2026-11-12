package com.as.labms.samplecollection.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;

public record SampleCollectionRequestDto(

        @NotNull(message = "Order item ID is required")
        @Positive(message = "Order item ID must be positive")
        Long orderItemId,

        @NotBlank(message = "Collected by is required")
        String collectedBy,

        LocalDateTime collectionDateTime,

        @NotBlank(message = "Specimen condition is required")
        String specimenCondition,

        String notes

) {
}