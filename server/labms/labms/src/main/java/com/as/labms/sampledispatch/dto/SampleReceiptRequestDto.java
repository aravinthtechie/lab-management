package com.as.labms.sampledispatch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SampleReceiptRequestDto(

        @NotBlank(message = "Received by is required")
        @Size(max = 100)
        String receivedBy,

        String notes
) {}