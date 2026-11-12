package com.as.labms.samplecollection.dto;

import java.time.LocalDateTime;

public record SampleCollectionResponseDto(

        Long id,
        Long orderId,
        Long orderItemId,
        String orderNumber,
        String testName,
        String specimenName,
        String sampleCode,
        String collectedBy,
        LocalDateTime collectionDateTime,
        String specimenCondition,
        String collectionStatus,
        String notes

) {
}