
package com.as.labms.referencerange.service.impl;

import com.as.labms.common.exception.ResourceNotFoundException;
import com.as.labms.common.exception.InvalidOperationException;

import com.as.labms.referencerange.dto.ReferenceRangeRequestDto;
import com.as.labms.referencerange.dto.ReferenceRangeResponseDto;
import com.as.labms.referencerange.entity.ReferenceRange;
import com.as.labms.referencerange.repository.ReferenceRangeRepository;
import com.as.labms.referencerange.service.ReferenceRangeService;

import com.as.labms.testparameter.entity.TestParameter;
import com.as.labms.testparameter.repository.TestParameterRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ReferenceRangeServiceImpl implements ReferenceRangeService {

    private final ReferenceRangeRepository referenceRangeRepository;
    private final TestParameterRepository testParameterRepository;

    // CREATE REFERENCE RANGE
    @Override
    public ReferenceRangeResponseDto createReferenceRange(
            ReferenceRangeRequestDto request) {

        validateRange(request);

        TestParameter parameter = getTestParameter(
                request.testParameterId()
        );

        ReferenceRange range = new ReferenceRange();

        range.setTestParameter(parameter);
        range.setGender(request.gender());
        range.setMinAge(request.minAge());
        range.setMaxAge(request.maxAge());
        range.setMinValue(request.minValue());
        range.setMaxValue(request.maxValue());
        range.setInterpretation(request.interpretation());
        range.setIsActive(true);

        ReferenceRange saved = referenceRangeRepository.save(range);

        return mapToResponse(saved);
    }

    // GET ALL ACTIVE REFERENCE RANGES
    @Override
    @Transactional(readOnly = true)
    public List<ReferenceRangeResponseDto> getAllReferenceRanges() {

        return referenceRangeRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET REFERENCE RANGE BY ID
    @Override
    @Transactional(readOnly = true)
    public ReferenceRangeResponseDto getReferenceRangeById(Long id) {

        ReferenceRange range = getReferenceRange(id);

        return mapToResponse(range);
    }

    // GET REFERENCE RANGES BY TEST PARAMETER
    @Override
    @Transactional(readOnly = true)
    public List<ReferenceRangeResponseDto> getRangesByParameter(
            Long parameterId) {

        // Validate test parameter
        getTestParameter(parameterId);

        return referenceRangeRepository
                .findByTestParameter_IdAndIsActiveTrue(parameterId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // UPDATE REFERENCE RANGE
    @Override
    public ReferenceRangeResponseDto updateReferenceRange(
            Long id,
            ReferenceRangeRequestDto request) {

        validateRange(request);

        ReferenceRange range = getReferenceRange(id);

        TestParameter parameter = getTestParameter(
                request.testParameterId()
        );

        range.setTestParameter(parameter);
        range.setGender(request.gender());
        range.setMinAge(request.minAge());
        range.setMaxAge(request.maxAge());
        range.setMinValue(request.minValue());
        range.setMaxValue(request.maxValue());
        range.setInterpretation(request.interpretation());

        return mapToResponse(referenceRangeRepository.save(range));
    }

    // DEACTIVATE REFERENCE RANGE
    @Override
    public void deactivateReferenceRange(Long id) {

        ReferenceRange range = getReferenceRange(id);

        range.setIsActive(false);

        referenceRangeRepository.save(range);
    }

    // FIND TEST PARAMETER OR THROW EXCEPTION
    private TestParameter getTestParameter(Long parameterId) {

        return testParameterRepository.findById(parameterId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Test parameter not found with ID: " + parameterId
                ));
    }

    // FIND REFERENCE RANGE OR THROW EXCEPTION
    private ReferenceRange getReferenceRange(Long id) {

        return referenceRangeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Reference range not found with ID: " + id
                ));
    }

    // VALIDATE REFERENCE RANGE
    private void validateRange(ReferenceRangeRequestDto request) {

        if (request.minAge() != null
                && request.maxAge() != null
                && request.minAge() > request.maxAge()) {

            throw new InvalidOperationException(
                    "Minimum age cannot be greater than maximum age"
            );
        }

        if (request.minValue() == null || request.maxValue() == null) {

            throw new InvalidOperationException(
                    "Minimum value and maximum value are required"
            );
        }

        if (request.minValue().compareTo(request.maxValue()) > 0) {

            throw new InvalidOperationException(
                    "Minimum value cannot be greater than maximum value"
            );
        }
    }

    // ENTITY TO DTO MAPPING
    private ReferenceRangeResponseDto mapToResponse(
            ReferenceRange range) {

        TestParameter parameter = range.getTestParameter();

        return new ReferenceRangeResponseDto(
                range.getId(),
                parameter.getId(),
                parameter.getParameterCode(),
                parameter.getParameterName(),
                parameter.getUnit(),
                range.getGender(),
                range.getMinAge(),
                range.getMaxAge(),
                range.getMinValue(),
                range.getMaxValue(),
                range.getInterpretation(),
                range.getIsActive(),
                range.getCreatedAt(),
                range.getUpdatedAt()
        );
    }
}
