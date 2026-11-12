
package com.as.labms.laborder.service.impl;

import com.as.labms.common.exception.DuplicateResourceException;
import com.as.labms.common.exception.InvalidOperationException;
import com.as.labms.common.exception.ResourceNotFoundException;

import com.as.labms.laborder.dto.LabOrderItemResponseDto;
import com.as.labms.laborder.dto.LabOrderRequestDto;
import com.as.labms.laborder.dto.LabOrderResponseDto;
import com.as.labms.laborder.entity.*;
import com.as.labms.laborder.repository.LabOrderRepository;
import com.as.labms.laborder.service.LabOrderService;

import com.as.labms.patient.entity.Patient;
import com.as.labms.patient.repository.PatientRepository;

import com.as.labms.doctor.entity.Doctor;
import com.as.labms.doctor.repository.DoctorRepository;

import com.as.labms.labtest.entity.LabTest;
import com.as.labms.labtest.repository.LabTestRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class LabOrderServiceImpl implements LabOrderService {

    private final LabOrderRepository labOrderRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final LabTestRepository labTestRepository;

    @Override
    public LabOrderResponseDto createOrder(LabOrderRequestDto request) {

        // 1. Validate patient
        Patient patient = patientRepository.findById(request.patientId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Patient not found with ID: " + request.patientId()
                ));

        // 2. Validate doctor (optional)
        Doctor doctor = null;

        if (request.doctorId() != null) {
            doctor = doctorRepository.findById(request.doctorId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Doctor not found with ID: " + request.doctorId()
                    ));
        }

        // 3. Prevent duplicate test IDs
        Set<Long> uniqueTestIds = new HashSet<>(request.testIds());

        if (uniqueTestIds.size() != request.testIds().size()) {
            throw new InvalidOperationException(
                    "Duplicate lab tests are not allowed in an order"
            );
        }

        // 4. Create LabOrder
        LabOrder order = new LabOrder();

        order.setOrderNumber(generateOrderNumber());
        order.setPatient(patient);
        order.setDoctor(doctor);

        order.setPriority(
                request.priority() != null
                        ? request.priority()
                        : OrderPriority.NORMAL
        );

        order.setOrderStatus(OrderStatus.REGISTERED);
        order.setNotes(request.notes());

        // 5. Add selected lab tests and calculate total
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (Long testId : request.testIds()) {

            LabTest labTest = labTestRepository.findById(testId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Lab test not found with ID: " + testId
                    ));

            // Only active tests can be ordered
            if (!Boolean.TRUE.equals(labTest.getIsActive())) {
                throw new InvalidOperationException(
                        "Lab test is inactive: " + labTest.getTestName()
                );
            }

            LabOrderItem item = new LabOrderItem();

            item.setLabTest(labTest);

            // Store test snapshot
            item.setTestCode(labTest.getTestCode());
            item.setTestName(labTest.getTestName());
            item.setPrice(labTest.getPrice());

            item.setItemStatus(OrderItemStatus.PENDING);

            order.addOrderItem(item);

            totalAmount = totalAmount.add(labTest.getPrice());
        }

        // 6. Calculate discount
        BigDecimal discountAmount =
                request.discountAmount() != null
                        ? request.discountAmount()
                        : BigDecimal.ZERO;

        if (discountAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidOperationException(
                    "Discount amount cannot be negative"
            );
        }

        if (discountAmount.compareTo(totalAmount) > 0) {
            throw new InvalidOperationException(
                    "Discount cannot exceed the total amount"
            );
        }

        BigDecimal netAmount = totalAmount.subtract(discountAmount);

        order.setTotalAmount(totalAmount);
        order.setDiscountAmount(discountAmount);
        order.setNetAmount(netAmount);

        // 7. Save order and its items
        // CascadeType.ALL saves the child items automatically.
        LabOrder savedOrder = labOrderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabOrderResponseDto> getAllOrders() {

        return labOrderRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LabOrderResponseDto getOrderById(Long id) {

        LabOrder order = labOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Lab order not found with ID: " + id
                ));

        return mapToResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabOrderResponseDto> getOrdersByPatient(Long patientId) {

        if (!patientRepository.existsById(patientId)) {
            throw new ResourceNotFoundException(
                    "Patient not found with ID: " + patientId
            );
        }

        return labOrderRepository
                .findByPatient_IdOrderByOrderDateDesc(patientId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Generate unique order number
    private String generateOrderNumber() {

        return "LAB-" + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }

    // Entity to Response DTO mapping
    private LabOrderResponseDto mapToResponse(LabOrder order) {

        List<LabOrderItemResponseDto> itemResponses =
                order.getOrderItems()
                        .stream()
                        .map(item -> new LabOrderItemResponseDto(
                                item.getId(),
                                item.getLabTest().getId(),
                                item.getTestCode(),
                                item.getTestName(),
                                item.getPrice(),
                                item.getItemStatus()
                        ))
                        .toList();

        return new LabOrderResponseDto(
                order.getId(),
                order.getOrderNumber(),
                order.getPatient().getId(),
                order.getDoctor() != null
                        ? order.getDoctor().getId()
                        : null,
                order.getOrderDate(),
                order.getPriority(),
                order.getOrderStatus(),
                order.getTotalAmount(),
                order.getDiscountAmount(),
                order.getNetAmount(),
                order.getNotes(),
                itemResponses,
                order.getCreatedAt()
        );
    }
}
