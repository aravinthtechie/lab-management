
package com.as.labms.labtest.service;

import com.as.labms.labtest.dto.LabTestRequestDto;
import com.as.labms.labtest.dto.LabTestResponseDto;

import java.util.List;

public interface LabTestService {

    LabTestResponseDto createTest(LabTestRequestDto request);

    List<LabTestResponseDto> getAllTests();

    LabTestResponseDto getTestById(Long id);

    LabTestResponseDto updateTest(Long id, LabTestRequestDto request);

    List<LabTestResponseDto> getTestsByCategory(Long categoryId);

    List<LabTestResponseDto> searchTests(String name);

    List<LabTestResponseDto> getActiveTests();

    void updateTestStatus(Long id, Boolean active);
}
