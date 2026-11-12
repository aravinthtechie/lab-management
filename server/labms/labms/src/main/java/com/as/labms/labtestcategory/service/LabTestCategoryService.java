
package com.as.labms.labtestcategory.service;

import com.as.labms.labtestcategory.dto.LabTestCategoryRequestDto;
import com.as.labms.labtestcategory.dto.LabTestCategoryResponseDto;

import java.util.List;

public interface LabTestCategoryService {

    LabTestCategoryResponseDto createCategory(LabTestCategoryRequestDto requestDto);

    List<LabTestCategoryResponseDto> getAllCategories();

    List<LabTestCategoryResponseDto> getActiveCategories();

    LabTestCategoryResponseDto getCategoryById(Long id);

    List<LabTestCategoryResponseDto> searchCategories(String search);

    LabTestCategoryResponseDto updateCategory(
            Long id, LabTestCategoryRequestDto requestDto);

    LabTestCategoryResponseDto updateCategoryStatus(
            Long id, boolean active);}
