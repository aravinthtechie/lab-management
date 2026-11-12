
package com.as.labms.specimen.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SpecimenTypeRequestDto(

        @NotBlank(message = "Specimen code is required")
        @Size(max = 30)
        String specimenCode,

        @NotBlank(message = "Specimen name is required")
        @Size(max = 100)
        String specimenName,

        @Size(max = 500)
        String description

) {}
