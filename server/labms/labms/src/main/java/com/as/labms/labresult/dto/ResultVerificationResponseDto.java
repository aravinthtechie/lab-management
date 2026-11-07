package com.as.labms.labresult.dto;

import java.time.LocalDateTime;

public record ResultVerificationResponseDto(
        Long id,
        Long orderItemId,
        String resultValue,
        String unit,
        String enteredBy,
        LocalDateTime resultDateTime,
        String resultStatus,
        String verifiedBy,
        LocalDateTime verifiedAt,
        String verificationRemarks
) {
}