package com.as.labms.sampledispatch.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SampleRejectionRequestDto(

        @NotBlank(message = "Rejected by is required")
        @Size(max = 100)
        String rejectedBy,

        @NotBlank(message = "Rejection reason is required")
        @Size(max = 500)
        String rejectionReason
) {}