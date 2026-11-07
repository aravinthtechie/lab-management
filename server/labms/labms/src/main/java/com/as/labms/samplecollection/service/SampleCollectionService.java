package com.as.labms.samplecollection.service;

import com.as.labms.samplecollection.dto.SampleCollectionRequestDto;
import com.as.labms.samplecollection.dto.SampleCollectionResponseDto;

import java.util.List;

public interface SampleCollectionService {

    SampleCollectionResponseDto collectSample(
            SampleCollectionRequestDto request
    );

    SampleCollectionResponseDto getSampleById(Long id);

    SampleCollectionResponseDto getSampleByOrderItemId(Long orderItemId);

    List<SampleCollectionResponseDto> getSamplesByOrderId(Long orderId);
}