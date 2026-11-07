package com.as.labms.sampledispatch.service;

import com.as.labms.sampledispatch.dto.*;

import java.util.List;

public interface SampleDispatchService {

    SampleDispatchResponseDto dispatchSample(
            SampleDispatchRequestDto request
    );

    SampleDispatchResponseDto getDispatchById(Long id);

    SampleDispatchResponseDto getDispatchBySampleId(Long sampleId);

    List<SampleDispatchResponseDto> getAllDispatches();

    SampleDispatchResponseDto receiveSample(
            Long id,
            SampleReceiptRequestDto request
    );

    SampleDispatchResponseDto rejectSample(
            Long id,
            SampleRejectionRequestDto request
    );
}