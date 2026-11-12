package com.as.labms.doctor.service;

import com.as.labms.doctor.dto.DoctorRequestDto;
import com.as.labms.doctor.dto.DoctorResponseDto;

import java.util.List;

public interface DoctorService {

    DoctorResponseDto createDoctor(DoctorRequestDto request);

    List<DoctorResponseDto> getAllDoctors();

    DoctorResponseDto getDoctorById(Long id);

    DoctorResponseDto updateDoctor(Long id, DoctorRequestDto request);

    List<DoctorResponseDto> searchDoctors(String name);

    void updateDoctorStatus(Long id, Boolean active);
}