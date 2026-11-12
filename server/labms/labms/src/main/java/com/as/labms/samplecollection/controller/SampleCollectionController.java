package com.as.labms.samplecollection.controller;

import com.as.labms.samplecollection.dto.SampleCollectionRequestDto;
import com.as.labms.samplecollection.dto.SampleCollectionResponseDto;
import com.as.labms.samplecollection.service.SampleCollectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sample-collections")
@RequiredArgsConstructor
public class SampleCollectionController {

    private final SampleCollectionService sampleCollectionService;

    @PostMapping
    public ResponseEntity<SampleCollectionResponseDto> collectSample(
            @Valid @RequestBody SampleCollectionRequestDto request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(sampleCollectionService.collectSample(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SampleCollectionResponseDto> getSampleById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                sampleCollectionService.getSampleById(id));
    }

    @GetMapping("/order-item/{orderItemId}")
    public ResponseEntity<SampleCollectionResponseDto> getSampleByOrderItemId(
            @PathVariable Long orderItemId) {

        return ResponseEntity.ok(
                sampleCollectionService.getSampleByOrderItemId(orderItemId));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<SampleCollectionResponseDto>> getSamplesByOrderId(
            @PathVariable Long orderId) {

        return ResponseEntity.ok(
                sampleCollectionService.getSamplesByOrderId(orderId));
    }
}