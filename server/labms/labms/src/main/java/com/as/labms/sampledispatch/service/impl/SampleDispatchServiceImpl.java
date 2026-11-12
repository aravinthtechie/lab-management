
package com.as.labms.sampledispatch.service.impl;

import com.as.labms.common.exception.DuplicateResourceException;
import com.as.labms.common.exception.InvalidOperationException;
import com.as.labms.common.exception.ResourceNotFoundException;

import com.as.labms.samplecollection.entity.SampleCollection;
import com.as.labms.samplecollection.repository.SampleCollectionRepository;

import com.as.labms.sampledispatch.dto.*;
import com.as.labms.sampledispatch.entity.SampleDispatch;
import com.as.labms.sampledispatch.repository.SampleDispatchRepository;
import com.as.labms.sampledispatch.service.SampleDispatchService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SampleDispatchServiceImpl implements SampleDispatchService {

    private final SampleDispatchRepository sampleDispatchRepository;

    private final SampleCollectionRepository sampleCollectionRepository;

    // DISPATCH SAMPLE
    @Override
    public SampleDispatchResponseDto dispatchSample(
            SampleDispatchRequestDto request) {

        // 1. Find sample collection
        SampleCollection sample = sampleCollectionRepository
                .findById(request.sampleCollectionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Sample collection not found with ID: "
                                + request.sampleCollectionId()
                ));

        // 2. Prevent duplicate dispatch
        if (sampleDispatchRepository.existsBySampleCollection_Id(
                sample.getId())) {

            throw new DuplicateResourceException(
                    "This sample has already been dispatched. Sample ID: "
                            + sample.getId()
            );
        }

        // 3. Validate collection status
        if (!"COLLECTED".equalsIgnoreCase(sample.getCollectionStatus())) {

            throw new InvalidOperationException(
                    "Only collected samples can be dispatched"
            );
        }

        // 4. Create sample dispatch
        SampleDispatch dispatch = new SampleDispatch();

        dispatch.setSampleCollection(sample);
        dispatch.setDispatchNumber(generateDispatchNumber());
        dispatch.setDispatchedBy(request.dispatchedBy());
        dispatch.setDestination(request.destination());

        dispatch.setDispatchDateTime(
                request.dispatchDateTime() != null
                        ? request.dispatchDateTime()
                        : LocalDateTime.now()
        );

        dispatch.setTransportCondition(request.transportCondition());
        dispatch.setDispatchStatus("DISPATCHED");
        dispatch.setNotes(request.notes());

        SampleDispatch saved = sampleDispatchRepository.save(dispatch);

        return mapToResponse(saved);
    }

    // GET DISPATCH BY ID
    @Override
    @Transactional(readOnly = true)
    public SampleDispatchResponseDto getDispatchById(Long id) {

        SampleDispatch dispatch = getDispatchEntity(id);

        return mapToResponse(dispatch);
    }

    // GET DISPATCH BY SAMPLE ID
    @Override
    @Transactional(readOnly = true)
    public SampleDispatchResponseDto getDispatchBySampleId(Long sampleId) {

        SampleDispatch dispatch = sampleDispatchRepository
                .findBySampleCollection_Id(sampleId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Dispatch record not found for sample ID: "
                                + sampleId
                ));

        return mapToResponse(dispatch);
    }

    // GET ALL DISPATCHES
    @Override
    @Transactional(readOnly = true)
    public List<SampleDispatchResponseDto> getAllDispatches() {

        return sampleDispatchRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // RECEIVE SAMPLE
    @Override
    public SampleDispatchResponseDto receiveSample(
            Long id,
            SampleReceiptRequestDto request) {

        SampleDispatch dispatch = getDispatchEntity(id);

        // Validate dispatch status
        if (!"DISPATCHED".equalsIgnoreCase(dispatch.getDispatchStatus())) {

            throw new InvalidOperationException(
                    "Only dispatched samples can be received"
            );
        }

        dispatch.setDispatchStatus("RECEIVED");
        dispatch.setReceivedBy(request.receivedBy());
        dispatch.setReceivedDateTime(LocalDateTime.now());

        if (request.notes() != null && !request.notes().isBlank()) {
            dispatch.setNotes(request.notes());
        }

        return mapToResponse(sampleDispatchRepository.save(dispatch));
    }

    // REJECT SAMPLE
    @Override
    public SampleDispatchResponseDto rejectSample(
            Long id,
            SampleRejectionRequestDto request) {

        SampleDispatch dispatch = getDispatchEntity(id);

        // Validate dispatch status
        if (!"DISPATCHED".equalsIgnoreCase(dispatch.getDispatchStatus())) {

            throw new InvalidOperationException(
                    "Only dispatched samples can be rejected"
            );
        }

        dispatch.setDispatchStatus("REJECTED");
        dispatch.setRejectedBy(request.rejectedBy());
        dispatch.setRejectedDateTime(LocalDateTime.now());
        dispatch.setRejectionReason(request.rejectionReason());

        return mapToResponse(sampleDispatchRepository.save(dispatch));
    }

    // FIND DISPATCH OR THROW EXCEPTION
    private SampleDispatch getDispatchEntity(Long id) {

        return sampleDispatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Sample dispatch not found with ID: " + id
                ));
    }

    // GENERATE DISPATCH NUMBER
    private String generateDispatchNumber() {

        return "DSP-" + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }

    // ENTITY TO DTO MAPPING
    private SampleDispatchResponseDto mapToResponse(
            SampleDispatch dispatch) {

        SampleCollection sample = dispatch.getSampleCollection();

        var orderItem = sample.getLabOrderItem();
        var order = orderItem.getLabOrder();

        return new SampleDispatchResponseDto(
                dispatch.getId(),
                dispatch.getDispatchNumber(),

                sample.getId(),
                sample.getSampleCode(),

                order.getId(),
                orderItem.getId(),
                orderItem.getTestName(),

                dispatch.getDispatchedBy(),
                dispatch.getDestination(),
                dispatch.getDispatchDateTime(),
                dispatch.getTransportCondition(),
                dispatch.getDispatchStatus(),

                dispatch.getReceivedBy(),
                dispatch.getReceivedDateTime(),

                dispatch.getRejectedBy(),
                dispatch.getRejectedDateTime(),
                dispatch.getRejectionReason(),

                dispatch.getNotes(),
                dispatch.getCreatedAt(),
                dispatch.getUpdatedAt()
        );
    }
}
