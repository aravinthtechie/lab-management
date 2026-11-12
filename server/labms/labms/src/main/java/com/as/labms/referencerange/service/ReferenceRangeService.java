package com.as.labms.referencerange.service;

import com.as.labms.referencerange.dto.ReferenceRangeRequestDto;
import com.as.labms.referencerange.dto.ReferenceRangeResponseDto;

import java.util.List;

public interface ReferenceRangeService {

    ReferenceRangeResponseDto createReferenceRange(
            ReferenceRangeRequestDto request
    );

    List<ReferenceRangeResponseDto> getAllReferenceRanges();

    ReferenceRangeResponseDto getReferenceRangeById(Long id);

    List<ReferenceRangeResponseDto> getRangesByParameter(Long parameterId);

    ReferenceRangeResponseDto updateReferenceRange(
            Long id,
            ReferenceRangeRequestDto request
    );

    void deactivateReferenceRange(Long id);
}