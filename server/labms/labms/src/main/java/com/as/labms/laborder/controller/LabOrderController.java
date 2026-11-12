package com.as.labms.laborder.controller;

import com.as.labms.laborder.dto.LabOrderRequestDto;
import com.as.labms.laborder.dto.LabOrderResponseDto;
import com.as.labms.laborder.service.LabOrderService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class LabOrderController {

    private final LabOrderService labOrderService;

    // Create order
    @PostMapping
    public ResponseEntity<LabOrderResponseDto> createOrder(
            @Valid @RequestBody LabOrderRequestDto request) {

        LabOrderResponseDto response =
                labOrderService.createOrder(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Get all orders
    @GetMapping
    public ResponseEntity<List<LabOrderResponseDto>> getAllOrders() {

        return ResponseEntity.ok(
                labOrderService.getAllOrders()
        );
    }

    // Get order by ID
    @GetMapping("/{id}")
    public ResponseEntity<LabOrderResponseDto> getOrderById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                labOrderService.getOrderById(id)
        );
    }

    // Get patient order history
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<LabOrderResponseDto>> getOrdersByPatient(
            @PathVariable Long patientId) {

        return ResponseEntity.ok(
                labOrderService.getOrdersByPatient(patientId)
        );
    }
}