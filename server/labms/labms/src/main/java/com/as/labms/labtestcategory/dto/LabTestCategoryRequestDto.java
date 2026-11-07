
package com.as.labms.labtestcategory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LabTestCategoryRequestDto(

        @NotBlank(message = "Category code is required")
        @Size(max = 50)
        String categoryCode,

        @NotBlank(message = "Category name is required")
        @Size(max = 100)
        String categoryName,

        String description

) {
}
