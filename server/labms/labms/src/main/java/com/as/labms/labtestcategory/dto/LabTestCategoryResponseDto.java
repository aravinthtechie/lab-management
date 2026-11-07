
package com.as.labms.labtestcategory.dto;

import java.time.LocalDateTime;

public record LabTestCategoryResponseDto(
        Long id,
        String categoryCode,
        String categoryName,
        String description,
        Boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
