package com.as.labms.labresult.service.impl;

import com.as.labms.laborder.entity.LabOrderItem;
import com.as.labms.laborder.repository.LabOrderItemRepository;

import com.as.labms.labresult.dto.LabResultRequestDto;
import com.as.labms.labresult.dto.LabResultResponseDto;
import com.as.labms.labresult.entity.LabResult;
import com.as.labms.labresult.repository.LabResultRepository;
import com.as.labms.labresult.service.LabResultService;

import com.as.labms.samplecollection.entity.SampleCollection;
import com.as.labms.samplecollection.repository.SampleCollectionRepository;

import com.as.labms.sampledispatch.entity.SampleDispatch;
import com.as.labms.sampledispatch.repository.SampleDispatchRepository;

import com.as.labms.testparameter.entity.TestParameter;
import com.as.labms.testparameter.repository.TestParameterRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LabResultServiceImpl implements LabResultService {

    private final LabResultRepository labResultRepository;
    private final LabOrderItemRepository labOrderItemRepository;
    private final TestParameterRepository testParameterRepository;
    private final SampleCollectionRepository sampleCollectionRepository;
    private final SampleDispatchRepository sampleDispatchRepository;

    @Override
    public LabResultResponseDto enterResult(LabResultRequestDto request) {

        // 1. Find the order item
        LabOrderItem orderItem = labOrderItemRepository
                .findById(request.orderItemId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Lab order item not found"
                ));

        // 2. Find the test parameter
        TestParameter parameter = testParameterRepository
                .findById(request.testParameterId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Test parameter not found"
                ));

        // 3. Verify that the parameter belongs to this ordered test
        if (!parameter.getLabTest().getId()
                .equals(orderItem.getLabTest().getId())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Test parameter does not belong to this lab order item"
            );
        }

        // 4. Verify that the parameter is active
        if (Boolean.FALSE.equals(parameter.getIsActive())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Test parameter is inactive"
            );
        }

        // 5. Find the collected sample for this order item
        SampleCollection sample = sampleCollectionRepository
                .findByLabOrderItem_Id(orderItem.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Sample collection not found for this order item"
                ));

        // 6. Find dispatch and ensure the sample was received
        SampleDispatch dispatch = sampleDispatchRepository
                .findBySampleCollection_Id(sample.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Sample has not been dispatched"
                ));

        if (!"RECEIVED".equalsIgnoreCase(dispatch.getDispatchStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Result entry is allowed only after sample receipt"
            );
        }

        // 7. Prevent duplicate results
        if (labResultRepository
                .existsByLabOrderItem_IdAndTestParameter_Id(
                        orderItem.getId(),
                        parameter.getId())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Result already exists for this test parameter"
            );
        }

        // 8. Create result
        LabResult result = new LabResult();

        result.setLabOrderItem(orderItem);
        result.setTestParameter(parameter);
        result.setResultValue(request.resultValue());

        // Use parameter's configured unit if request unit is empty
        result.setUnit(
                StringUtils.hasText(request.unit())
                        ? request.unit()
                        : parameter.getUnit()
        );

        result.setRemarks(request.remarks());
        result.setEnteredBy(request.enteredBy());
        result.setResultDateTime(LocalDateTime.now());
        result.setResultStatus("PENDING_VERIFICATION");

        LabResult savedResult = labResultRepository.save(result);

        return mapToResponse(savedResult);
    }

    @Override
    @Transactional(readOnly = true)
    public LabResultResponseDto getResultById(Long id) {

        LabResult result = labResultRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Lab result not found"
                ));

        return mapToResponse(result);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabResultResponseDto> getAllResults() {

        return labResultRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabResultResponseDto> getResultsByOrderItemId(
            Long orderItemId) {

        return labResultRepository.findByLabOrderItem_Id(orderItemId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabResultResponseDto> getResultsByOrderId(Long orderId) {

        return labResultRepository.findByLabOrderItem_LabOrder_Id(orderId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private LabResultResponseDto mapToResponse(LabResult result) {

        LabOrderItem orderItem = result.getLabOrderItem();

        SampleCollection sample = sampleCollectionRepository
                .findByLabOrderItem_Id(orderItem.getId())
                .orElse(null);

        TestParameter parameter = result.getTestParameter();

        return new LabResultResponseDto(
                result.getId(),

                orderItem.getLabOrder().getId(),
                orderItem.getLabOrder().getOrderNumber(),

                orderItem.getId(),
                orderItem.getTestName(),

                sample != null ? sample.getId() : null,
                sample != null ? sample.getSampleCode() : null,

                parameter.getId(),
                parameter.getParameterCode(),
                parameter.getParameterName(),

                result.getResultValue(),
                result.getUnit(),
                result.getRemarks(),

                result.getEnteredBy(),
                result.getResultDateTime(),

                result.getResultStatus(),

                result.getCreatedAt(),
                result.getUpdatedAt()
        );
    }
}