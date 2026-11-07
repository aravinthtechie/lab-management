package com.as.labms.labresult.service.impl;

import com.as.labms.common.exception.InvalidOperationException;
import com.as.labms.common.exception.ResourceNotFoundException;
import com.as.labms.labresult.dto.ResultVerificationRequestDto;
import com.as.labms.labresult.dto.ResultVerificationResponseDto;
import com.as.labms.labresult.entity.LabResult;
import com.as.labms.labresult.repository.LabResultRepository;
import com.as.labms.labresult.service.ResultVerificationService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ResultVerificationServiceImpl
        implements ResultVerificationService {

    private final LabResultRepository labResultRepository;

    private static final String PENDING = "PENDING_VERIFICATION";
    private static final String VERIFIED = "VERIFIED";
    private static final String REJECTED = "REJECTED";

    @Override
    @Transactional(readOnly = true)
    public List<ResultVerificationResponseDto> getPendingResults() {

        return labResultRepository
                .findByResultStatusOrderByResultDateTimeAsc(PENDING)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ResultVerificationResponseDto getResultForVerification(
            Long resultId) {

        LabResult result = getResult(resultId);

        return mapToResponse(result);
    }

    @Override
    public ResultVerificationResponseDto verifyResult(
            Long resultId,
            ResultVerificationRequestDto request) {

        LabResult result = getResult(resultId);

        validatePendingResult(result);

        result.setResultStatus(VERIFIED);
        result.setVerifiedBy(request.verifiedBy());
        result.setVerifiedAt(LocalDateTime.now());
        result.setVerificationRemarks(request.verificationRemarks());

        LabResult savedResult = labResultRepository.save(result);

        return mapToResponse(savedResult);
    }

    @Override
    public ResultVerificationResponseDto rejectResult(
            Long resultId,
            ResultVerificationRequestDto request) {

        LabResult result = getResult(resultId);

        validatePendingResult(result);

        if (request.verificationRemarks() == null ||
                request.verificationRemarks().isBlank()) {

            throw new InvalidOperationException(
                    "Rejection remarks are required"
            );
        }

        result.setResultStatus(REJECTED);
        result.setVerifiedBy(request.verifiedBy());
        result.setVerifiedAt(LocalDateTime.now());
        result.setVerificationRemarks(request.verificationRemarks());

        LabResult savedResult = labResultRepository.save(result);

        return mapToResponse(savedResult);
    }

    private LabResult getResult(Long resultId) {

        return labResultRepository.findById(resultId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Lab result not found with id: " + resultId
                        )
                );
    }

    private void validatePendingResult(LabResult result) {

        if (!PENDING.equals(result.getResultStatus())) {

            throw new InvalidOperationException(
                    "Only pending results can be verified or rejected. " +
                            "Current status: " + result.getResultStatus()
            );
        }
    }

    private ResultVerificationResponseDto mapToResponse(
            LabResult result) {

        return new ResultVerificationResponseDto(
                result.getId(),
                result.getLabOrderItem().getId(),
                result.getResultValue(),
                result.getUnit(),
                result.getEnteredBy(),
                result.getResultDateTime(),
                result.getResultStatus(),
                result.getVerifiedBy(),
                result.getVerifiedAt(),
                result.getVerificationRemarks()
        );
    }
}