
package com.as.labms.samplecollection.service.impl;

import com.as.labms.common.exception.DuplicateResourceException;
import com.as.labms.common.exception.InvalidOperationException;
import com.as.labms.common.exception.ResourceNotFoundException;

import com.as.labms.laborder.entity.LabOrder;
import com.as.labms.laborder.entity.LabOrderItem;
import com.as.labms.laborder.entity.OrderItemStatus;
import com.as.labms.laborder.entity.OrderStatus;

import com.as.labms.laborder.repository.LabOrderItemRepository;

import com.as.labms.samplecollection.dto.SampleCollectionRequestDto;
import com.as.labms.samplecollection.dto.SampleCollectionResponseDto;
import com.as.labms.samplecollection.entity.SampleCollection;
import com.as.labms.samplecollection.repository.SampleCollectionRepository;
import com.as.labms.samplecollection.service.SampleCollectionService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class SampleCollectionServiceImpl
        implements SampleCollectionService {

    private final SampleCollectionRepository sampleCollectionRepository;

    private final LabOrderItemRepository labOrderItemRepository;

    // COLLECT SAMPLE
    @Override
    public SampleCollectionResponseDto collectSample(
            SampleCollectionRequestDto request) {

        // 1. Find order item
        LabOrderItem orderItem = labOrderItemRepository
                .findById(request.orderItemId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Lab order item not found with ID: "
                                + request.orderItemId()
                ));

        // 2. Prevent duplicate collection
        if (sampleCollectionRepository.existsByLabOrderItem_Id(
                orderItem.getId())) {

            throw new DuplicateResourceException(
                    "Sample already collected for order item ID: "
                            + orderItem.getId()
            );
        }

        // 3. Validate specimen type
        if (!orderItem.getLabTest().getSpecimenType().isActive()) {

            throw new InvalidOperationException(
                    "Specimen type is inactive"
            );
        }

        // 4. Create sample collection
        SampleCollection sample = new SampleCollection();

        sample.setLabOrderItem(orderItem);

        sample.setSpecimenType(
                orderItem.getLabTest().getSpecimenType()
        );

        sample.setSampleCode(
                "SMP-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase()
        );

        sample.setCollectedBy(request.collectedBy());

        sample.setCollectionDateTime(
                request.collectionDateTime() != null
                        ? request.collectionDateTime()
                        : LocalDateTime.now()
        );

        sample.setSpecimenCondition(request.specimenCondition());

        sample.setCollectionStatus("COLLECTED");

        sample.setNotes(request.notes());

        SampleCollection savedSample =
                sampleCollectionRepository.save(sample);

        // 5. Update order item status
        orderItem.setItemStatus(
                OrderItemStatus.SAMPLE_COLLECTED
        );

        labOrderItemRepository.save(orderItem);

        // 6. Update order status if all items are collected
        updateOrderStatus(orderItem.getLabOrder());

        // 7. Return response
        return mapToResponse(savedSample);
    }

    // UPDATE ORDER STATUS
    private void updateOrderStatus(LabOrder order) {

        boolean allCollected = order.getOrderItems()
                .stream()
                .allMatch(item ->
                        item.getItemStatus()
                                == OrderItemStatus.SAMPLE_COLLECTED
                );

        if (allCollected) {
            order.setOrderStatus(OrderStatus.SAMPLE_COLLECTED);
        }
    }

    // GET SAMPLE BY ID
    @Override
    @Transactional(readOnly = true)
    public SampleCollectionResponseDto getSampleById(Long id) {

        SampleCollection sample = getSample(id);

        return mapToResponse(sample);
    }

    // GET SAMPLE BY ORDER ITEM ID
    @Override
    @Transactional(readOnly = true)
    public SampleCollectionResponseDto getSampleByOrderItemId(
            Long orderItemId) {

        SampleCollection sample = sampleCollectionRepository
                .findByLabOrderItem_Id(orderItemId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Sample collection not found for order item ID: "
                                + orderItemId
                ));

        return mapToResponse(sample);
    }

    // GET SAMPLES BY ORDER ID
    @Override
    @Transactional(readOnly = true)
    public List<SampleCollectionResponseDto> getSamplesByOrderId(
            Long orderId) {

        return sampleCollectionRepository
                .findByLabOrderItem_LabOrder_Id(orderId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // FIND SAMPLE OR THROW EXCEPTION
    private SampleCollection getSample(Long id) {

        return sampleCollectionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Sample collection not found with ID: " + id
                ));
    }

    // ENTITY TO DTO MAPPING
    private SampleCollectionResponseDto mapToResponse(
            SampleCollection sample) {

        LabOrderItem item = sample.getLabOrderItem();

        LabOrder order = item.getLabOrder();

        return new SampleCollectionResponseDto(
                sample.getId(),
                order.getId(),
                item.getId(),
                order.getOrderNumber(),
                item.getTestName(),
                sample.getSpecimenType().getSpecimenName(),
                sample.getSampleCode(),
                sample.getCollectedBy(),
                sample.getCollectionDateTime(),
                sample.getSpecimenCondition(),
                sample.getCollectionStatus(),
                sample.getNotes()
        );
    }
}
