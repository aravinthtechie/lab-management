
package com.as.labms.specimen.service;

import com.as.labms.specimen.dto.SpecimenTypeRequestDto;
import com.as.labms.specimen.dto.SpecimenTypeResponseDto;

import java.util.List;

public interface SpecimenTypeService {

    SpecimenTypeResponseDto createSpecimen(
            SpecimenTypeRequestDto request
    );

    SpecimenTypeResponseDto updateSpecimen(
            Long id,
            SpecimenTypeRequestDto request
    );

    SpecimenTypeResponseDto getSpecimenById(Long id);

    List<SpecimenTypeResponseDto> getAllSpecimens();

    List<SpecimenTypeResponseDto> getActiveSpecimens();

    List<SpecimenTypeResponseDto> searchSpecimens(String search);

    SpecimenTypeResponseDto updateStatus(Long id, boolean active);
}
