package com.as.labms.organization.dto;

import com.as.labms.organization.entity.BranchType;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BranchRequestDto {

    @NotNull
    private Long organizationId;

    @NotBlank
    private String branchCode;

    @NotBlank
    private String branchName;

    @NotNull
    private BranchType branchType;

    private String phone;
    private String email;
    private String address;
    private String city;
    private String state;
    private String pincode;
}