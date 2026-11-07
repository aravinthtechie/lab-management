
package com.as.labms.specimen.controller;

import com.as.labms.specimen.dto.SpecimenTypeRequestDto;
import com.as.labms.specimen.dto.SpecimenTypeResponseDto;
import com.as.labms.specimen.service.SpecimenTypeService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specimen-types")
@RequiredArgsConstructor
public class SpecimenTypeController {

    private final SpecimenTypeService specimenService;

    @PostMapping
    public ResponseEntity<SpecimenTypeResponseDto> createSpecimen(
            @Valid @RequestBody SpecimenTypeRequestDto request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(specimenService.createSpecimen(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SpecimenTypeResponseDto> updateSpecimen(
            @PathVariable Long id,
            @Valid @RequestBody SpecimenTypeRequestDto request) {

        return ResponseEntity.ok(
                specimenService.updateSpecimen(id, request)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpecimenTypeResponseDto> getSpecimen(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                specimenService.getSpecimenById(id)
        );
    }

    @GetMapping
    public ResponseEntity<List<SpecimenTypeResponseDto>> getAllSpecimens() {

        return ResponseEntity.ok(
                specimenService.getAllSpecimens()
        );
    }

    @GetMapping("/active")
    public ResponseEntity<List<SpecimenTypeResponseDto>> getActiveSpecimens() {

        return ResponseEntity.ok(
                specimenService.getActiveSpecimens()
        );
    }

    @GetMapping("/search")
    public ResponseEntity<List<SpecimenTypeResponseDto>> searchSpecimens(
            @RequestParam String search) {

        return ResponseEntity.ok(
                specimenService.searchSpecimens(search)
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<SpecimenTypeResponseDto> updateStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {

        return ResponseEntity.ok(
                specimenService.updateStatus(id, active)
        );
    }
}
