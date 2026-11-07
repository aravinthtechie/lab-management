package com.as.labms.sampledispatch.controller;

import com.as.labms.sampledispatch.dto.*;
import com.as.labms.sampledispatch.service.SampleDispatchService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sample-dispatches")
@RequiredArgsConstructor
public class SampleDispatchController {

    private final SampleDispatchService sampleDispatchService;

    @PostMapping
    public ResponseEntity<SampleDispatchResponseDto> dispatchSample(
            @Valid @RequestBody SampleDispatchRequestDto request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sampleDispatchService.dispatchSample(request));
    }

    @GetMapping
    public ResponseEntity<List<SampleDispatchResponseDto>> getAllDispatches() {

        return ResponseEntity.ok(
                sampleDispatchService.getAllDispatches()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<SampleDispatchResponseDto> getDispatchById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                sampleDispatchService.getDispatchById(id)
        );
    }

    @GetMapping("/sample/{sampleId}")
    public ResponseEntity<SampleDispatchResponseDto> getDispatchBySampleId(
            @PathVariable Long sampleId) {

        return ResponseEntity.ok(
                sampleDispatchService.getDispatchBySampleId(sampleId)
        );
    }

    @PutMapping("/{id}/receive")
    public ResponseEntity<SampleDispatchResponseDto> receiveSample(
            @PathVariable Long id,
            @Valid @RequestBody SampleReceiptRequestDto request) {

        return ResponseEntity.ok(
                sampleDispatchService.receiveSample(id, request)
        );
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<SampleDispatchResponseDto> rejectSample(
            @PathVariable Long id,
            @Valid @RequestBody SampleRejectionRequestDto request) {

        return ResponseEntity.ok(
                sampleDispatchService.rejectSample(id, request)
        );
    }
}