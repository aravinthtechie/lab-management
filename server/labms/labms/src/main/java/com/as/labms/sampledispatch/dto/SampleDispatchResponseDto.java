package com.as.labms.sampledispatch.dto;

import java.time.LocalDateTime;

public record SampleDispatchResponseDto(

        Long id,
        String dispatchNumber,

        Long sampleCollectionId,
        String sampleCode,

        Long orderId,
        Long orderItemId,
        String testName,

        String dispatchedBy,
        String destination,
        LocalDateTime dispatchDateTime,
        String transportCondition,
        String dispatchStatus,

        String receivedBy,
        LocalDateTime receivedDateTime,

        String rejectedBy,
        LocalDateTime rejectedDateTime,
        String rejectionReason,

        String notes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}