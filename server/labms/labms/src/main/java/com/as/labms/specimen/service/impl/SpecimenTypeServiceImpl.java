
package com.as.labms.specimen.service.impl;

import com.as.labms.common.exception.DuplicateResourceException;
import com.as.labms.common.exception.ResourceNotFoundException;

import com.as.labms.specimen.dto.SpecimenTypeRequestDto;
import com.as.labms.specimen.dto.SpecimenTypeResponseDto;
import com.as.labms.specimen.entity.SpecimenType;
import com.as.labms.specimen.repository.SpecimenTypeRepository;
import com.as.labms.specimen.service.SpecimenTypeService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SpecimenTypeServiceImpl implements SpecimenTypeService {

    private final SpecimenTypeRepository specimenRepository;

    // CREATE SPECIMEN TYPE
    @Override
    public SpecimenTypeResponseDto createSpecimen(
            SpecimenTypeRequestDto request) {

        String specimenCode = request.specimenCode().trim();

        // Check duplicate specimen code
        if (specimenRepository.existsBySpecimenCodeIgnoreCase(
                specimenCode)) {

            throw new DuplicateResourceException(
                    "Specimen code already exists: " + specimenCode
            );
        }

        SpecimenType specimen = new SpecimenType();

        specimen.setSpecimenCode(specimenCode);
        specimen.setSpecimenName(request.specimenName().trim());
        specimen.setDescription(request.description());
        specimen.setActive(true);

        return toResponse(specimenRepository.save(specimen));
    }

    // UPDATE SPECIMEN TYPE
    @Override
    public SpecimenTypeResponseDto updateSpecimen(
            Long id,
            SpecimenTypeRequestDto request) {

        SpecimenType specimen = getEntityById(id);

        String specimenCode = request.specimenCode().trim();

        // Check duplicate code excluding current specimen
        specimenRepository.findBySpecimenCodeIgnoreCase(specimenCode)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new DuplicateResourceException(
                                "Specimen code already exists: "
                                        + specimenCode
                        );
                    }
                });

        specimen.setSpecimenCode(specimenCode);
        specimen.setSpecimenName(request.specimenName().trim());
        specimen.setDescription(request.description());

        return toResponse(specimenRepository.save(specimen));
    }

    // GET SPECIMEN BY ID
    @Override
    @Transactional(readOnly = true)
    public SpecimenTypeResponseDto getSpecimenById(Long id) {

        return toResponse(getEntityById(id));
    }

    // GET ALL SPECIMENS
    @Override
    @Transactional(readOnly = true)
    public List<SpecimenTypeResponseDto> getAllSpecimens() {

        return specimenRepository
                .findAllByOrderBySpecimenNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // GET ACTIVE SPECIMENS
    @Override
    @Transactional(readOnly = true)
    public List<SpecimenTypeResponseDto> getActiveSpecimens() {

        return specimenRepository
                .findByActiveTrueOrderBySpecimenNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // UPDATE SPECIMEN STATUS
    @Override
    public SpecimenTypeResponseDto updateStatus(
            Long id,
            boolean active) {

        SpecimenType specimen = getEntityById(id);

        specimen.setActive(active);

        return toResponse(specimenRepository.save(specimen));
    }

    // SEARCH SPECIMENS
    @Override
    @Transactional(readOnly = true)
    public List<SpecimenTypeResponseDto> searchSpecimens(String search) {

        if (search == null || search.isBlank()) {
            return List.of();
        }

        String value = search.trim();

        return specimenRepository
                .findBySpecimenNameContainingIgnoreCaseOrSpecimenCodeContainingIgnoreCase(
                        value, value
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // FIND SPECIMEN OR THROW EXCEPTION
    private SpecimenType getEntityById(Long id) {

        return specimenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Specimen type not found with ID: " + id
                ));
    }

    // ENTITY TO DTO MAPPING
    private SpecimenTypeResponseDto toResponse(
            SpecimenType specimen) {

        return new SpecimenTypeResponseDto(
                specimen.getId(),
                specimen.getSpecimenCode(),
                specimen.getSpecimenName(),
                specimen.getDescription(),
                specimen.isActive(),
                specimen.getCreatedAt(),
                specimen.getUpdatedAt()
        );
    }
}
