package com.as.labms.patient.repository;

import com.as.labms.patient.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    List<Patient> findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String firstName,
            String lastName
    );
    @Query("""
            SELECT p FROM Patient p
            WHERE
                LOWER(CONCAT(
                    COALESCE(p.firstName, ''), ' ',
                    COALESCE(p.lastName, '')
                )) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(p.firstName, ''))
                    LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(p.lastName, ''))
                    LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(p.mobileNumber, ''))
                    LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(p.patientNumber, ''))
                    LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(COALESCE(p.email, ''))
                    LIKE LOWER(CONCAT('%', :search, '%'))
            """)
    List<Patient> searchPatients(@Param("search") String search);

}