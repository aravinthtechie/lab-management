
package com.as.labms.organization.service.impl;

import com.as.labms.common.exception.DuplicateResourceException;
import com.as.labms.common.exception.ResourceNotFoundException;

import com.as.labms.organization.dto.*;
import com.as.labms.organization.entity.*;
import com.as.labms.organization.repository.*;
import com.as.labms.organization.service.BranchService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BranchServiceImpl implements BranchService {

    private final BranchRepository branchRepository;
    private final OrganizationRepository organizationRepository;

    public BranchServiceImpl(
            BranchRepository branchRepository,
            OrganizationRepository organizationRepository) {

        this.branchRepository = branchRepository;
        this.organizationRepository = organizationRepository;
    }

    // CREATE BRANCH
    @Override
    @Transactional
    public BranchResponseDto createBranch(BranchRequestDto request) {

        // 1. Validate organization
        Organization organization = organizationRepository
                .findById(request.getOrganizationId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Organization not found with ID: "
                                + request.getOrganizationId()
                ));

        // 2. Check duplicate branch code
        if (branchRepository.existsByOrganization_IdAndBranchCode(
                request.getOrganizationId(),
                request.getBranchCode())) {

            throw new DuplicateResourceException(
                    "Branch code already exists: " + request.getBranchCode()
            );
        }

        // 3. Create branch entity
        Branch branch = new Branch();

        branch.setOrganization(organization);
        branch.setBranchCode(request.getBranchCode());
        branch.setBranchName(request.getBranchName());
        branch.setBranchType(request.getBranchType());

        branch.setPhone(request.getPhone());
        branch.setEmail(request.getEmail());
        branch.setAddress(request.getAddress());
        branch.setCity(request.getCity());
        branch.setState(request.getState());
        branch.setPincode(request.getPincode());

        branch.setIsActive(true);

        // 4. Save branch
        Branch savedBranch = branchRepository.save(branch);

        // 5. Return response
        return mapToResponse(savedBranch);
    }

    // GET ALL BRANCHES
    @Override
    @Transactional(readOnly = true)
    public List<BranchResponseDto> getAllBranches() {

        return branchRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET BRANCH BY ID
    @Override
    @Transactional(readOnly = true)
    public BranchResponseDto getBranchById(Long id) {

        Branch branch = getBranch(id);

        return mapToResponse(branch);
    }

    // GET BRANCHES BY ORGANIZATION
    @Override
    @Transactional(readOnly = true)
    public List<BranchResponseDto> getBranchesByOrganization(
            Long organizationId) {

        // Validate organization exists
        if (!organizationRepository.existsById(organizationId)) {
            throw new ResourceNotFoundException(
                    "Organization not found with ID: " + organizationId
            );
        }

        return branchRepository
                .findByOrganization_IdAndIsActiveTrue(organizationId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // FIND BRANCH BY ID
    private Branch getBranch(Long id) {

        return branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Branch not found with ID: " + id
                ));
    }

    // ENTITY TO DTO MAPPING
    private BranchResponseDto mapToResponse(Branch branch) {

        return new BranchResponseDto(
                branch.getId(),
                branch.getOrganization().getId(),
                branch.getBranchCode(),
                branch.getBranchName(),
                branch.getBranchType(),
                branch.getPhone(),
                branch.getEmail(),
                branch.getAddress(),
                branch.getCity(),
                branch.getState(),
                branch.getPincode(),
                branch.getIsActive(),
                branch.getCreatedAt()
        );
    }
}
