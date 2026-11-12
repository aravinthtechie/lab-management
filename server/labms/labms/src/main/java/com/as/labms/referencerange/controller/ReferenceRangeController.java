package com.as.labms.referencerange.controller;

import com.as.labms.referencerange.dto.ReferenceRangeRequestDto;
import com.as.labms.referencerange.dto.ReferenceRangeResponseDto;
import com.as.labms.referencerange.service.ReferenceRangeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reference-ranges")
@RequiredArgsConstructor
public class ReferenceRangeController {

    private final ReferenceRangeService referenceRangeService;

    @PostMapping
    public ResponseEntity<ReferenceRangeResponseDto> createReferenceRange(
            @Valid @RequestBody ReferenceRangeRequestDto request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(referenceRangeService.createReferenceRange(request));
    }

    @GetMapping
    public ResponseEntity<List<ReferenceRangeResponseDto>>
    getAllReferenceRanges() {

        return ResponseEntity.ok(
                referenceRangeService.getAllReferenceRanges());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReferenceRangeResponseDto> getReferenceRangeById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                referenceRangeService.getReferenceRangeById(id));
    }

    @GetMapping("/parameter/{parameterId}")
    public ResponseEntity<List<ReferenceRangeResponseDto>>
    getRangesByParameter(@PathVariable Long parameterId) {

        return ResponseEntity.ok(
                referenceRangeService.getRangesByParameter(parameterId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReferenceRangeResponseDto> updateReferenceRange(
            @PathVariable Long id,
            @Valid @RequestBody ReferenceRangeRequestDto request) {

        return ResponseEntity.ok(
                referenceRangeService.updateReferenceRange(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deactivateReferenceRange(
            @PathVariable Long id) {

        referenceRangeService.deactivateReferenceRange(id);

        return ResponseEntity.ok(
                "Reference range deactivated successfully");
    }
}