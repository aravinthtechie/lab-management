package com.as.labms.labresult.service;

import com.as.labms.labresult.dto.ResultVerificationRequestDto;
import com.as.labms.labresult.dto.ResultVerificationResponseDto;

import java.util.List;

public interface ResultVerificationService {

    List<ResultVerificationResponseDto> getPendingResults();

    ResultVerificationResponseDto getResultForVerification(Long resultId);

    ResultVerificationResponseDto verifyResult(
            Long resultId,
            ResultVerificationRequestDto request
    );

    ResultVerificationResponseDto rejectResult(
            Long resultId,
            ResultVerificationRequestDto request
    );
}