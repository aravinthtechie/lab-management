package com.as.labms.labresult.dto;

import java.time.LocalDateTime;

public record LabResultResponseDto(

        Long id,

        Long orderId,
        String orderNumber,

        Long orderItemId,
        String testName,

        Long sampleCollectionId,
        String sampleCode,

        Long testParameterId,
        String parameterCode,
        String parameterName,

        String resultValue,
        String unit,
        String remarks,

        String enteredBy,
        LocalDateTime resultDateTime,

        String resultStatus,

        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}