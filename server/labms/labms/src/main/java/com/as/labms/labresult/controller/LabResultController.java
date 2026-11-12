package com.as.labms.labresult.controller;

import com.as.labms.labresult.dto.LabResultRequestDto;
import com.as.labms.labresult.dto.LabResultResponseDto;
import com.as.labms.labresult.service.LabResultService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab-results")
@RequiredArgsConstructor
public class LabResultController {

    private final LabResultService labResultService;

    // Enter a result for one test parameter
    @PostMapping
    public ResponseEntity<LabResultResponseDto> enterResult(
            @Valid @RequestBody LabResultRequestDto request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(labResultService.enterResult(request));
    }

    // Get all results
    @GetMapping
    public ResponseEntity<List<LabResultResponseDto>> getAllResults() {

        return ResponseEntity.ok(
                labResultService.getAllResults()
        );
    }

    // Get result by ID
    @GetMapping("/{id}")
    public ResponseEntity<LabResultResponseDto> getResultById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                labResultService.getResultById(id)
        );
    }

    // Get all parameter results for an order item
    @GetMapping("/order-item/{orderItemId}")
    public ResponseEntity<List<LabResultResponseDto>> getResultsByOrderItemId(
            @PathVariable Long orderItemId) {

        return ResponseEntity.ok(
                labResultService.getResultsByOrderItemId(orderItemId)
        );
    }

    // Get all results for an order
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<LabResultResponseDto>> getResultsByOrderId(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                labResultService.getResultsByOrderId(orderId)
        );
    }
}