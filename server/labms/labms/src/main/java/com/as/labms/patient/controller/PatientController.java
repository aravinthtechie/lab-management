
package com.as.labms.patient.controller;

import com.as.labms.patient.dto.*;
import com.as.labms.patient.service.PatientService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    public ResponseEntity<PatientResponseDto> savePatient(
            @Valid @RequestBody PatientRequestDto request) {

        PatientResponseDto response =
                patientService.savePatient(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Get patients by name
    @GetMapping("/search")
    public ResponseEntity<List<PatientResponseDto>> getPatientsByName(
            @RequestParam String name) {

        return ResponseEntity.ok(
                patientService.searchPatients(name)
        );
    }

}
