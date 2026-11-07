package com.as.labms.testparameter.service;

import com.as.labms.testparameter.dto.TestParameterRequestDto;
import com.as.labms.testparameter.dto.TestParameterResponseDto;

import java.util.List;

public interface TestParameterService {

    TestParameterResponseDto createParameter(
            TestParameterRequestDto request
    );

    List<TestParameterResponseDto> getAllParameters();

    TestParameterResponseDto getParameterById(Long id);

    List<TestParameterResponseDto> getParametersByLabTest(Long labTestId);

    TestParameterResponseDto updateParameter(
            Long id,
            TestParameterRequestDto request
    );

    void deactivateParameter(Long id);
}