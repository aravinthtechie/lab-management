package com.as.labms.testparameter.service.impl;

import com.as.labms.labtest.entity.LabTest;
import com.as.labms.labtest.repository.LabTestRepository;
import com.as.labms.testparameter.dto.TestParameterRequestDto;
import com.as.labms.testparameter.dto.TestParameterResponseDto;
import com.as.labms.testparameter.entity.TestParameter;
import com.as.labms.testparameter.repository.TestParameterRepository;
import com.as.labms.testparameter.service.TestParameterService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TestParameterServiceImpl implements TestParameterService {

    private final TestParameterRepository parameterRepository;
    private final LabTestRepository labTestRepository;

    @Override
    public TestParameterResponseDto createParameter(
            TestParameterRequestDto request) {

        LabTest labTest = labTestRepository.findById(request.labTestId())
                .orElseThrow(() ->
                        new RuntimeException("Lab test not found"));

        if (parameterRepository.existsByLabTest_IdAndParameterCodeIgnoreCase(
                request.labTestId(), request.parameterCode())) {
            throw new RuntimeException("Parameter code already exists for this lab test");
        }

        TestParameter parameter = new TestParameter();

        parameter.setLabTest(labTest);
        parameter.setParameterCode(request.parameterCode());
        parameter.setParameterName(request.parameterName());
        parameter.setUnit(request.unit());
        parameter.setDataType(request.dataType().toUpperCase());
        parameter.setDisplayOrder(request.displayOrder());
        parameter.setIsActive(true);

        TestParameter savedParameter =
                parameterRepository.save(parameter);

        return mapToResponse(savedParameter);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestParameterResponseDto> getAllParameters() {

        return parameterRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TestParameterResponseDto getParameterById(Long id) {

        TestParameter parameter = parameterRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Test parameter not found"));

        return mapToResponse(parameter);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestParameterResponseDto> getParametersByLabTest(
            Long labTestId) {

        if (!labTestRepository.existsById(labTestId)) {
            throw new RuntimeException("Lab test not found");
        }

        return parameterRepository
                .findByLabTest_IdAndIsActiveTrue(labTestId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public TestParameterResponseDto updateParameter(
            Long id,
            TestParameterRequestDto request) {

        TestParameter parameter = parameterRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Test parameter not found"));

        LabTest labTest = labTestRepository.findById(request.labTestId())
                .orElseThrow(() ->
                        new RuntimeException("Lab test not found"));

        boolean duplicate = parameterRepository
                .existsByLabTest_IdAndParameterCodeIgnoreCase(
                        request.labTestId(),
                        request.parameterCode()
                );

        if (duplicate &&
                !(parameter.getLabTest().getId().equals(request.labTestId())
                        && parameter.getParameterCode()
                        .equalsIgnoreCase(request.parameterCode()))) {
            throw new RuntimeException(
                    "Parameter code already exists for this lab test");
        }

        parameter.setLabTest(labTest);
        parameter.setParameterCode(request.parameterCode());
        parameter.setParameterName(request.parameterName());
        parameter.setUnit(request.unit());
        parameter.setDataType(request.dataType().toUpperCase());
        parameter.setDisplayOrder(request.displayOrder());

        return mapToResponse(parameterRepository.save(parameter));
    }

    @Override
    public void deactivateParameter(Long id) {

        TestParameter parameter = parameterRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Test parameter not found"));

        parameter.setIsActive(false);

        parameterRepository.save(parameter);
    }

    private TestParameterResponseDto mapToResponse(
            TestParameter parameter) {

        return new TestParameterResponseDto(
                parameter.getId(),
                parameter.getLabTest().getId(),
                parameter.getLabTest().getTestCode(),
                parameter.getLabTest().getTestName(),
                parameter.getParameterCode(),
                parameter.getParameterName(),
                parameter.getUnit(),
                parameter.getDataType(),
                parameter.getDisplayOrder(),
                parameter.getIsActive(),
                parameter.getCreatedAt(),
                parameter.getUpdatedAt()
        );
    }
}