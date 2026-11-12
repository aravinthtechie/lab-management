
package com.as.labms.labtest.controller;

import com.as.labms.labtest.dto.LabTestRequestDto;
import com.as.labms.labtest.dto.LabTestResponseDto;
import com.as.labms.labtest.service.LabTestService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab-tests")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class LabTestController {

    private final LabTestService labTestService;

    @PostMapping
    public ResponseEntity<LabTestResponseDto> createTest(
            @Valid @RequestBody LabTestRequestDto request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(labTestService.createTest(request));
    }

    @GetMapping
    public ResponseEntity<List<LabTestResponseDto>> getAllTests() {

        return ResponseEntity.ok(labTestService.getAllTests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabTestResponseDto> getTestById(
            @PathVariable Long id) {

        return ResponseEntity.ok(labTestService.getTestById(id));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<LabTestResponseDto>> getTestsByCategory(
            @PathVariable Long categoryId) {

        return ResponseEntity.ok(
                labTestService.getTestsByCategory(categoryId)
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<LabTestResponseDto>> searchTests(
            @RequestParam String name) {

        return ResponseEntity.ok(labTestService.searchTests(name));
    }

    @GetMapping("/active")
    public ResponseEntity<List<LabTestResponseDto>> getActiveTests() {

        return ResponseEntity.ok(labTestService.getActiveTests());
    }

    @PutMapping("/{id}")
    public ResponseEntity<LabTestResponseDto> updateTest(
            @PathVariable Long id,
            @Valid @RequestBody LabTestRequestDto request) {

        return ResponseEntity.ok(
                labTestService.updateTest(id, request)
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateTestStatus(
            @PathVariable Long id,
            @RequestParam Boolean active) {

        labTestService.updateTestStatus(id, active);

        return ResponseEntity.noContent().build();
    }
}
