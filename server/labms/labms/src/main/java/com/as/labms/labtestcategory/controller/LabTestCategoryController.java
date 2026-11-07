package com.as.labms.labtestcategory.controller;

import com.as.labms.labtestcategory.dto.LabTestCategoryRequestDto;
import com.as.labms.labtestcategory.dto.LabTestCategoryResponseDto;
import com.as.labms.labtestcategory.service.LabTestCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab-test-categories")
@RequiredArgsConstructor
public class LabTestCategoryController {

    private final LabTestCategoryService labTestCategoryService;

    // Create category
    @PostMapping
    public ResponseEntity<LabTestCategoryResponseDto> createCategory(
            @Valid @RequestBody LabTestCategoryRequestDto requestDto) {

        LabTestCategoryResponseDto response =
                labTestCategoryService.createCategory(requestDto);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Get all categories
    @GetMapping
    public ResponseEntity<List<LabTestCategoryResponseDto>> getAllCategories() {

        return ResponseEntity.ok(
                labTestCategoryService.getAllCategories()
        );
    }

    // Get active categories
    @GetMapping("/active")
    public ResponseEntity<List<LabTestCategoryResponseDto>> getActiveCategories() {

        return ResponseEntity.ok(
                labTestCategoryService.getActiveCategories()
        );
    }

    // Get category by ID
    @GetMapping("/{id}")
    public ResponseEntity<LabTestCategoryResponseDto> getCategoryById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                labTestCategoryService.getCategoryById(id)
        );
    }

    // Search categories
    @GetMapping("/search")
    public ResponseEntity<List<LabTestCategoryResponseDto>> searchCategories(
            @RequestParam String search) {

        return ResponseEntity.ok(
                labTestCategoryService.searchCategories(search)
        );
    }

    // Update category
    @PutMapping("/{id}")
    public ResponseEntity<LabTestCategoryResponseDto> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody LabTestCategoryRequestDto requestDto) {

        return ResponseEntity.ok(
                labTestCategoryService.updateCategory(id, requestDto)
        );
    }

    // Activate / Deactivate category
    @PatchMapping("/{id}/status")
    public ResponseEntity<LabTestCategoryResponseDto> updateCategoryStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {

        return ResponseEntity.ok(
                labTestCategoryService.updateCategoryStatus(id, active)
        );
    }
}