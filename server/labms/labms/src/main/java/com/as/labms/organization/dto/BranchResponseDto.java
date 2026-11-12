package com.as.labms.organization.dto;

import com.as.labms.organization.entity.BranchType;
import java.time.LocalDateTime;

public record BranchResponseDto(
        Long id,
        Long organizationId,
        String branchCode,
        String branchName,
        BranchType branchType,
        String phone,
        String email,
        String address,
        String city,
        String state,
        String pincode,
        Boolean isActive,
        LocalDateTime createdAt
) {}