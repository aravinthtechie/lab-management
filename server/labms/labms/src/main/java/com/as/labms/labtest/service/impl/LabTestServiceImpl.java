
package com.as.labms.labtest.service.impl;

import com.as.labms.common.exception.DuplicateResourceException;
import com.as.labms.common.exception.ResourceNotFoundException;

import com.as.labms.labtest.dto.LabTestRequestDto;
import com.as.labms.labtest.dto.LabTestResponseDto;
import com.as.labms.labtest.entity.LabTest;
import com.as.labms.labtest.repository.LabTestRepository;
import com.as.labms.labtest.service.LabTestService;

import com.as.labms.labtestcategory.entity.LabTestCategory;
import com.as.labms.labtestcategory.repository.LabTestCategoryRepository;

import com.as.labms.specimen.entity.SpecimenType;
import com.as.labms.specimen.repository.SpecimenTypeRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LabTestServiceImpl implements LabTestService {

    private final LabTestRepository labTestRepository;
    private final LabTestCategoryRepository categoryRepository;
    private final SpecimenTypeRepository specimenTypeRepository;

    // CREATE LAB TEST
    @Override
    public LabTestResponseDto createTest(LabTestRequestDto request) {

        String code = request.testCode().trim();

        if (labTestRepository.existsByTestCodeIgnoreCase(code)) {
            throw new DuplicateResourceException(
                    "Test code already exists: " + code
            );
        }

        LabTestCategory category = getCategory(request.categoryId());

        SpecimenType specimenType =
                getSpecimenType(request.specimenTypeId());

        LabTest test = new LabTest();

        mapRequestToEntity(request, test, category, specimenType);

        LabTest savedTest = labTestRepository.save(test);

        return mapToResponse(savedTest);
    }

    // GET ALL LAB TESTS
    @Override
    @Transactional(readOnly = true)
    public List<LabTestResponseDto> getAllTests() {

        return labTestRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET LAB TEST BY ID
    @Override
    @Transactional(readOnly = true)
    public LabTestResponseDto getTestById(Long id) {

        return mapToResponse(getTest(id));
    }

    // UPDATE LAB TEST
    @Override
    public LabTestResponseDto updateTest(
            Long id,
            LabTestRequestDto request) {

        LabTest test = getTest(id);

        labTestRepository.findByTestCodeIgnoreCase(
                request.testCode().trim()
        ).ifPresent(existing -> {

            if (!existing.getId().equals(id)) {
                throw new DuplicateResourceException(
                        "Test code already exists: "
                                + request.testCode()
                );
            }
        });

        LabTestCategory category =
                getCategory(request.categoryId());

        SpecimenType specimenType =
                getSpecimenType(request.specimenTypeId());

        mapRequestToEntity(
                request,
                test,
                category,
                specimenType
        );

        LabTest updatedTest = labTestRepository.save(test);

        return mapToResponse(updatedTest);
    }

    // GET TESTS BY CATEGORY
    @Override
    @Transactional(readOnly = true)
    public List<LabTestResponseDto> getTestsByCategory(Long categoryId) {

        getCategory(categoryId);

        return labTestRepository.findByCategory_Id(categoryId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // SEARCH LAB TESTS BY NAME
    @Override
    @Transactional(readOnly = true)
    public List<LabTestResponseDto> searchTests(String name) {

        return labTestRepository
                .findByTestNameContainingIgnoreCase(name.trim())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GET ACTIVE TESTS
    @Override
    @Transactional(readOnly = true)
    public List<LabTestResponseDto> getActiveTests() {

        return labTestRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // UPDATE TEST STATUS
    @Override
    public void updateTestStatus(Long id, Boolean active) {

        LabTest test = getTest(id);

        test.setIsActive(active);

        labTestRepository.save(test);
    }

    // FIND TEST BY ID
    private LabTest getTest(Long id) {

        return labTestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Lab test not found with ID: " + id
                ));
    }

    // FIND CATEGORY BY ID
    private LabTestCategory getCategory(Long categoryId) {

        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Lab test category not found with ID: " + categoryId
                ));
    }

    // FIND SPECIMEN TYPE BY ID
    private SpecimenType getSpecimenType(Long specimenTypeId) {

        return specimenTypeRepository.findById(specimenTypeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Specimen type not found with ID: " + specimenTypeId
                ));
    }

    // MAP REQUEST DTO TO ENTITY
    private void mapRequestToEntity(
            LabTestRequestDto request,
            LabTest test,
            LabTestCategory category,
            SpecimenType specimenType) {

        test.setTestCode(request.testCode().trim());
        test.setTestName(request.testName().trim());
        test.setCategory(category);
        test.setDescription(request.description());

        // Set SpecimenType entity, not specimenTypeId
        test.setSpecimenType(specimenType);

        test.setPrice(request.price());
        test.setTurnaroundTime(request.turnaroundTime());
    }

    // MAP ENTITY TO RESPONSE DTO
    private LabTestResponseDto mapToResponse(LabTest test) {

        return new LabTestResponseDto(
                test.getId(),
                test.getTestCode(),
                test.getTestName(),

                test.getCategory().getId(),
                test.getCategory().getCategoryCode(),
                test.getCategory().getCategoryName(),

                test.getDescription(),

                test.getSpecimenType().getId(),
                test.getSpecimenType().getSpecimenCode(),
                test.getSpecimenType().getSpecimenName(),

                test.getPrice(),
                test.getTurnaroundTime(),
                test.getIsActive(),
                test.getCreatedAt(),
                test.getUpdatedAt()
        );
    }
}
