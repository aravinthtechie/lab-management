
package com.as.labms.doctor.service.impl;

import com.as.labms.common.exception.ResourceNotFoundException;
import com.as.labms.common.exception.DuplicateResourceException;
import com.as.labms.doctor.dto.DoctorRequestDto;
import com.as.labms.doctor.dto.DoctorResponseDto;
import com.as.labms.doctor.entity.Doctor;
import com.as.labms.doctor.repository.DoctorRepository;
import com.as.labms.doctor.service.DoctorService;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;

    @Override
    public DoctorResponseDto createDoctor(DoctorRequestDto request) {

        if (doctorRepository.existsByRegistrationNumber(
                request.registrationNumber())) {

            throw new DuplicateResourceException(
                    "Doctor registration number already exists: "
                            + request.registrationNumber()
            );
        }

        Doctor doctor = new Doctor();

        doctor.setDoctorName(request.doctorName());
        doctor.setRegistrationNumber(request.registrationNumber());
        doctor.setSpecialization(request.specialization());
        doctor.setHospitalName(request.hospitalName());
        doctor.setMobileNumber(request.mobileNumber());
        doctor.setEmail(request.email());
        doctor.setIsActive(true);

        Doctor savedDoctor = doctorRepository.save(doctor);

        return mapToResponse(savedDoctor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponseDto> getAllDoctors() {

        return doctorRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DoctorResponseDto getDoctorById(Long id) {

        Doctor doctor = getDoctorOrThrow(id);

        return mapToResponse(doctor);
    }

    @Override
    public DoctorResponseDto updateDoctor(
            Long id,
            DoctorRequestDto request) {

        Doctor doctor = getDoctorOrThrow(id);

        doctorRepository.findByRegistrationNumber(
                request.registrationNumber()
        ).ifPresent(existingDoctor -> {

            if (!existingDoctor.getId().equals(id)) {
                throw new DuplicateResourceException(
                        "Registration number already belongs to another doctor: "
                                + request.registrationNumber()
                );
            }
        });

        doctor.setDoctorName(request.doctorName());
        doctor.setRegistrationNumber(request.registrationNumber());
        doctor.setSpecialization(request.specialization());
        doctor.setHospitalName(request.hospitalName());
        doctor.setMobileNumber(request.mobileNumber());
        doctor.setEmail(request.email());

        return mapToResponse(doctorRepository.save(doctor));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DoctorResponseDto> searchDoctors(String name) {

        return doctorRepository
                .findByDoctorNameContainingIgnoreCase(name)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public void updateDoctorStatus(Long id, Boolean active) {

        Doctor doctor = getDoctorOrThrow(id);

        doctor.setIsActive(active);

        doctorRepository.save(doctor);
    }

    private Doctor getDoctorOrThrow(Long id) {

        return doctorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Doctor not found with ID: " + id
                ));
    }

    private DoctorResponseDto mapToResponse(Doctor doctor) {

        return new DoctorResponseDto(
                doctor.getId(),
                doctor.getDoctorName(),
                doctor.getRegistrationNumber(),
                doctor.getSpecialization(),
                doctor.getHospitalName(),
                doctor.getMobileNumber(),
                doctor.getEmail(),
                doctor.getIsActive(),
                doctor.getCreatedAt(),
                doctor.getUpdatedAt()
        );
    }
}
