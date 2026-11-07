package com.as.labms.patient.service;

import com.as.labms.patient.dto.PatientRequestDto;
import com.as.labms.patient.dto.PatientResponseDto;

import java.util.List;

public interface PatientService {

    PatientResponseDto savePatient(PatientRequestDto request);

    List<PatientResponseDto> getPatientsByName(String name);
    List<PatientResponseDto> searchPatients(String search);
}