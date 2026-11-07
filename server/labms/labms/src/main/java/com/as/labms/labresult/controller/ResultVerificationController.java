package com.as.labms.labresult.controller;

import com.as.labms.labresult.dto.ResultVerificationRequestDto;
import com.as.labms.labresult.dto.ResultVerificationResponseDto;
import com.as.labms.labresult.service.ResultVerificationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/result-verifications")
@RequiredArgsConstructor
public class ResultVerificationController {

    private final ResultVerificationService resultVerificationService;

    // Get all pending results for verification
    @GetMapping("/pending")
    public ResponseEntity<List<ResultVerificationResponseDto>> getPendingResults() {

        return ResponseEntity.ok(
                resultVerificationService.getPendingResults()
        );
    }

    // Get a specific result
    @GetMapping("/{resultId}")
    public ResponseEntity<ResultVerificationResponseDto> getResultForVerification(
            @PathVariable Long resultId) {

        return ResponseEntity.ok(
                resultVerificationService.getResultForVerification(resultId)
        );
    }

    // Verify a lab result
    @PutMapping("/{resultId}/verify")
    public ResponseEntity<ResultVerificationResponseDto> verifyResult(
            @PathVariable Long resultId,
            @Valid @RequestBody ResultVerificationRequestDto request) {

        return ResponseEntity.ok(
                resultVerificationService.verifyResult(resultId, request)
        );
    }

    // Reject a lab result
    @PutMapping("/{resultId}/reject")
    public ResponseEntity<ResultVerificationResponseDto> rejectResult(
            @PathVariable Long resultId,
            @Valid @RequestBody ResultVerificationRequestDto request) {

        return ResponseEntity.ok(
                resultVerificationService.rejectResult(resultId, request)
        );
    }
}