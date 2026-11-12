
package com.as.labms.patient.service.Impl;

import com.as.labms.common.exception.ResourceNotFoundException;
import com.as.labms.common.exception.InvalidOperationException;

import com.as.labms.patient.dto.*;
import com.as.labms.patient.entity.Patient;
import com.as.labms.patient.repository.PatientRepository;
import com.as.labms.patient.service.PatientService;

import com.as.labms.organization.entity.Branch;
import com.as.labms.organization.repository.BranchRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final BranchRepository branchRepository;

    public PatientServiceImpl(
            PatientRepository patientRepository,
            BranchRepository branchRepository) {

        this.patientRepository = patientRepository;
        this.branchRepository = branchRepository;
    }

    // SAVE PATIENT
    @Override
    @Transactional
    public PatientResponseDto savePatient(PatientRequestDto request) {

        // 1. Find registered branch
        Branch branch = branchRepository
                .findById(request.getRegisteredBranchId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Branch not found with ID: "
                                + request.getRegisteredBranchId()
                ));

        // 2. Create patient number
        String patientNumber = generatePatientNumber();

        // 3. Create Patient entity
        Patient patient = new Patient();

        patient.setPatientNumber(patientNumber);
        patient.setFirstName(request.getFirstName());
        patient.setLastName(request.getLastName());
        patient.setDateOfBirth(request.getDateOfBirth());
        patient.setGender(request.getGender());
        patient.setBloodGroup(request.getBloodGroup());
        patient.setMobileNumber(request.getMobileNumber());
        patient.setAlternateMobileNumber(
                request.getAlternateMobileNumber()
        );
        patient.setEmail(request.getEmail());

        patient.setAddressLine1(request.getAddressLine1());
        patient.setAddressLine2(request.getAddressLine2());
        patient.setCity(request.getCity());
        patient.setState(request.getState());
        patient.setPincode(request.getPincode());

        patient.setEmergencyContactName(
                request.getEmergencyContactName()
        );
        patient.setEmergencyContactNumber(
                request.getEmergencyContactNumber()
        );

        patient.setRegisteredBranch(branch);
        patient.setActive(true);

        // 4. Save patient into MySQL
        Patient savedPatient = patientRepository.save(patient);

        // 5. Return response
        return mapToResponse(savedPatient);
    }

    // GET PATIENTS BY NAME
    @Override
    @Transactional(readOnly = true)
    public List<PatientResponseDto> getPatientsByName(String name) {

        if (name == null || name.isBlank()) {
            throw new InvalidOperationException(
                    "Patient name search cannot be empty"
            );
        }

        return patientRepository
                .findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                        name.trim(), name.trim()
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // SEARCH PATIENTS
    @Override
    @Transactional(readOnly = true)
    public List<PatientResponseDto> searchPatients(String search) {

        if (search == null || search.isBlank()) {
            throw new InvalidOperationException(
                    "Patient search value cannot be empty"
            );
        }

        return patientRepository.searchPatients(search.trim())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // GENERATE PATIENT NUMBER
    private String generatePatientNumber() {

        return "PAT-" + LocalDate.now().getYear() + "-"
                + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }

    // ENTITY TO DTO MAPPING
    private PatientResponseDto mapToResponse(Patient patient) {

        return new PatientResponseDto(
                patient.getId(),
                patient.getPatientNumber(),
                patient.getFirstName(),
                patient.getLastName(),
                patient.getMobileNumber(),
                patient.getEmail(),
                patient.getRegisteredBranch().getId()
        );
    }
}
