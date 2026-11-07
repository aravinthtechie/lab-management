package com.as.labms.organization.repository;

import com.as.labms.organization.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BranchRepository
        extends JpaRepository<Branch, Long> {

    List<Branch> findByOrganization_Id(Long organizationId);

    List<Branch> findByOrganization_IdAndIsActiveTrue(
            Long organizationId);

    boolean existsByOrganization_IdAndBranchCode(
            Long organizationId,
            String branchCode);
}