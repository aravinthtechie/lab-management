package com.as.labms.laborder.dto;

import com.as.labms.laborder.entity.OrderItemStatus;

import java.math.BigDecimal;

public record LabOrderItemResponseDto(

        Long id,
        Long labTestId,
        String testCode,
        String testName,
        BigDecimal price,
        OrderItemStatus itemStatus

) {
}