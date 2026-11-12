package com.as.labms.labresult.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResultVerificationRequestDto(

        @NotBlank(message = "Verified by is required")
        @Size(max = 100, message = "Verified by cannot exceed 100 characters")
        String verifiedBy,

        @Size(max = 1000, message = "Verification remarks cannot exceed 1000 characters")
        String verificationRemarks

) {
}