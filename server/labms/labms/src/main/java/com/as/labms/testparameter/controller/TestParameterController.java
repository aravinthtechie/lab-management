package com.as.labms.testparameter.controller;

import com.as.labms.testparameter.dto.TestParameterRequestDto;
import com.as.labms.testparameter.dto.TestParameterResponseDto;
import com.as.labms.testparameter.service.TestParameterService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test-parameters")
@RequiredArgsConstructor
public class TestParameterController {

    private final TestParameterService parameterService;

    @PostMapping
    public ResponseEntity<TestParameterResponseDto> createParameter(
            @Valid @RequestBody TestParameterRequestDto request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(parameterService.createParameter(request));
    }

    @GetMapping
    public ResponseEntity<List<TestParameterResponseDto>> getAllParameters() {

        return ResponseEntity.ok(parameterService.getAllParameters());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestParameterResponseDto> getParameterById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                parameterService.getParameterById(id));
    }

    @GetMapping("/lab-test/{labTestId}")
    public ResponseEntity<List<TestParameterResponseDto>>
    getParametersByLabTest(@PathVariable Long labTestId) {

        return ResponseEntity.ok(
                parameterService.getParametersByLabTest(labTestId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TestParameterResponseDto> updateParameter(
            @PathVariable Long id,
            @Valid @RequestBody TestParameterRequestDto request) {

        return ResponseEntity.ok(
                parameterService.updateParameter(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deactivateParameter(
            @PathVariable Long id) {

        parameterService.deactivateParameter(id);

        return ResponseEntity.ok("Test parameter deactivated successfully");
    }
}