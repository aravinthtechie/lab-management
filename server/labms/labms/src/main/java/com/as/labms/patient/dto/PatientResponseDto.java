package com.as.labms.patient.dto;

public record PatientResponseDto(
        Long id,
        String patientNumber,
        String firstName,
        String lastName,
        String mobileNumber,
        String email,
        Long registeredBranchId
) {}