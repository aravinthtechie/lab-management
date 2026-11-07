
package com.as.labms.labtestcategory.service.Impl;

import com.as.labms.common.exception.DuplicateResourceException;
import com.as.labms.common.exception.ResourceNotFoundException;

import com.as.labms.labtestcategory.dto.LabTestCategoryRequestDto;
import com.as.labms.labtestcategory.dto.LabTestCategoryResponseDto;
import com.as.labms.labtestcategory.entity.LabTestCategory;
import com.as.labms.labtestcategory.repository.LabTestCategoryRepository;
import com.as.labms.labtestcategory.service.LabTestCategoryService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LabTestCategoryServiceImpl implements LabTestCategoryService {

    private final LabTestCategoryRepository categoryRepository;

    @Override
    public LabTestCategoryResponseDto createCategory(
            LabTestCategoryRequestDto request) {

        String code = request.categoryCode().trim();

        if (categoryRepository.existsByCategoryCodeIgnoreCase(code)) {
            throw new DuplicateResourceException(
                    "Category code already exists: " + code
            );
        }

        LabTestCategory category = new LabTestCategory();

        category.setCategoryCode(code);
        category.setCategoryName(request.categoryName().trim());
        category.setDescription(request.description());

        LabTestCategory savedCategory = categoryRepository.save(category);

        return mapToResponse(savedCategory);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabTestCategoryResponseDto> getAllCategories() {

        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public LabTestCategoryResponseDto getCategoryById(Long id) {

        return mapToResponse(getCategory(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabTestCategoryResponseDto> searchCategories(String search) {

        if (search == null || search.isBlank()) {
            throw new IllegalArgumentException(
                    "Search keyword cannot be empty"
            );
        }

        return categoryRepository
                .findByCategoryNameContainingIgnoreCase(search.trim())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public LabTestCategoryResponseDto updateCategory(
            Long id,
            LabTestCategoryRequestDto request) {

        LabTestCategory category = getCategory(id);

        String code = request.categoryCode().trim();

        categoryRepository.findByCategoryCodeIgnoreCase(code)
                .ifPresent(existing -> {

                    if (!existing.getId().equals(id)) {
                        throw new DuplicateResourceException(
                                "Category code already exists: " + code
                        );
                    }
                });

        category.setCategoryCode(code);
        category.setCategoryName(request.categoryName().trim());
        category.setDescription(request.description());

        return mapToResponse(categoryRepository.save(category));
    }

    @Override
    public LabTestCategoryResponseDto updateCategoryStatus(
            Long id,
            boolean active) {

        LabTestCategory category = getCategory(id);

        category.setIsActive(active);

        return mapToResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public List<LabTestCategoryResponseDto> getActiveCategories() {

        return categoryRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private LabTestCategory getCategory(Long id) {

        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Lab test category not found with ID: " + id
                ));
    }

    private LabTestCategoryResponseDto mapToResponse(
            LabTestCategory category) {

        return new LabTestCategoryResponseDto(
                category.getId(),
                category.getCategoryCode(),
                category.getCategoryName(),
                category.getDescription(),
                category.getIsActive(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}
