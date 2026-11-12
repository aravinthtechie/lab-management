package com.as.labms.patient.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Setter
@Getter
public class PatientRequestDto {

    @NotBlank
    private String firstName;

    private String lastName;

    private LocalDate dateOfBirth;

    private String gender;

    private String bloodGroup;

    @NotBlank
    private String mobileNumber;

    private String alternateMobileNumber;

    @Email
    private String email;

    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String pincode;

    private String emergencyContactName;
    private String emergencyContactNumber;

    @NotNull
    private Long registeredBranchId;

    // Generate patientNumber in the backend.

    // Getters and setters
}