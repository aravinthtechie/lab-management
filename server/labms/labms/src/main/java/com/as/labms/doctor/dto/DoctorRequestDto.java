package com.as.labms.doctor.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DoctorRequestDto(

        @NotBlank(message = "Doctor name is required")
        @Size(max = 150)
        String doctorName,

        @NotBlank(message = "Registration number is required")
        @Size(max = 100)
        String registrationNumber,

        @Size(max = 150)
        String specialization,

        @Size(max = 200)
        String hospitalName,

        @Size(max = 20)
        String mobileNumber,

        @Email(message = "Enter a valid email address")
        @Size(max = 150)
        String email

) {}