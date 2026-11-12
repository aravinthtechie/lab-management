package com.as.labms.laborder.service;

import com.as.labms.laborder.dto.LabOrderRequestDto;
import com.as.labms.laborder.dto.LabOrderResponseDto;

import java.util.List;

public interface LabOrderService {

    LabOrderResponseDto createOrder(LabOrderRequestDto request);

    List<LabOrderResponseDto> getAllOrders();

    LabOrderResponseDto getOrderById(Long id);

    List<LabOrderResponseDto> getOrdersByPatient(Long patientId);
}