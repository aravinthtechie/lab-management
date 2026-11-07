package com.as.labms.labresult.service;

import com.as.labms.labresult.dto.LabResultRequestDto;
import com.as.labms.labresult.dto.LabResultResponseDto;

import java.util.List;

public interface LabResultService {

    LabResultResponseDto enterResult(LabResultRequestDto request);

    LabResultResponseDto getResultById(Long id);

    List<LabResultResponseDto> getAllResults();

    List<LabResultResponseDto> getResultsByOrderItemId(Long orderItemId);

    List<LabResultResponseDto> getResultsByOrderId(Long orderId);
}