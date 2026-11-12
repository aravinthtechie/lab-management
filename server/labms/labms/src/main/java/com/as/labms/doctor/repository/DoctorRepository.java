package com.as.labms.doctor.repository;

import com.as.labms.doctor.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    boolean existsByRegistrationNumber(String registrationNumber);

    Optional<Doctor> findByRegistrationNumber(String registrationNumber);

    List<Doctor> findByDoctorNameContainingIgnoreCase(String doctorName);

    List<Doctor> findByIsActiveTrue();
}