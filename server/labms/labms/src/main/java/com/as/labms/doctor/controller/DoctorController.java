package com.as.labms.doctor.controller;

import com.as.labms.doctor.dto.DoctorRequestDto;
import com.as.labms.doctor.dto.DoctorResponseDto;
import com.as.labms.doctor.service.DoctorService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping
    public ResponseEntity<DoctorResponseDto> createDoctor(
            @Valid @RequestBody DoctorRequestDto request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(doctorService.createDoctor(request));
    }

    @GetMapping
    public ResponseEntity<List<DoctorResponseDto>> getAllDoctors() {

        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorResponseDto> getDoctorById(
            @PathVariable Long id) {

        return ResponseEntity.ok(doctorService.getDoctorById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<DoctorResponseDto>> searchDoctors(
            @RequestParam String name) {

        return ResponseEntity.ok(
                doctorService.searchDoctors(name)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorResponseDto> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorRequestDto request) {

        return ResponseEntity.ok(
                doctorService.updateDoctor(id, request)
        );
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateDoctorStatus(
            @PathVariable Long id,
            @RequestParam Boolean active) {

        doctorService.updateDoctorStatus(id, active);

        return ResponseEntity.noContent().build();
    }
}