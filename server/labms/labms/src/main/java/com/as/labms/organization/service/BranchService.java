package com.as.labms.organization.service;

import com.as.labms.organization.dto.BranchRequestDto;
import com.as.labms.organization.dto.BranchResponseDto;

import java.util.List;

public interface BranchService {

    BranchResponseDto createBranch(BranchRequestDto request);

    List<BranchResponseDto> getAllBranches();

    BranchResponseDto getBranchById(Long id);

    List<BranchResponseDto> getBranchesByOrganization(
            Long organizationId);
}