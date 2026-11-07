package com.as.labms.laborder.dto;

import com.as.labms.laborder.entity.OrderPriority;
import com.as.labms.laborder.entity.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record LabOrderResponseDto(

        Long id,
        String orderNumber,

        Long patientId,
        Long doctorId,

        LocalDateTime orderDate,

        OrderPriority priority,
        OrderStatus orderStatus,

        BigDecimal totalAmount,
        BigDecimal discountAmount,
        BigDecimal netAmount,

        String notes,

        List<LabOrderItemResponseDto> orderItems,

        LocalDateTime createdAt

) {
}