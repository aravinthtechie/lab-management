package com.as.labms.organization.controller;

import com.as.labms.organization.dto.*;
import com.as.labms.organization.service.BranchService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
@CrossOrigin(origins = "http://localhost:4200")
public class BranchController {

    private final BranchService branchService;

    public BranchController(BranchService branchService) {
        this.branchService = branchService;
    }

    // CREATE BRANCH
    @PostMapping
    public ResponseEntity<BranchResponseDto> createBranch(
            @Valid @RequestBody BranchRequestDto request) {

        BranchResponseDto response =
                branchService.createBranch(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // GET ALL BRANCHES
    @GetMapping
    public ResponseEntity<List<BranchResponseDto>> getAllBranches() {

        return ResponseEntity.ok(
                branchService.getAllBranches());
    }

    // GET BRANCH BY ID
    @GetMapping("/{id}")
    public ResponseEntity<BranchResponseDto> getBranchById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                branchService.getBranchById(id));
    }

    // GET BRANCHES BY ORGANIZATION
    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<List<BranchResponseDto>>
    getBranchesByOrganization(
            @PathVariable Long organizationId) {

        return ResponseEntity.ok(
                branchService.getBranchesByOrganization(
                        organizationId));
    }
}