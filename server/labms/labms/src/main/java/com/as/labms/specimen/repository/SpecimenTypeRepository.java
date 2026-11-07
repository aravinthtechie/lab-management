
package com.as.labms.specimen.repository;

import com.as.labms.specimen.entity.SpecimenType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpecimenTypeRepository
        extends JpaRepository<SpecimenType, Long> {

    boolean existsBySpecimenCodeIgnoreCase(String specimenCode);

    Optional<SpecimenType> findBySpecimenCodeIgnoreCase(
            String specimenCode
    );

    List<SpecimenType> findAllByOrderBySpecimenNameAsc();

    List<SpecimenType> findByActiveTrueOrderBySpecimenNameAsc();

    List<SpecimenType> findBySpecimenNameContainingIgnoreCase(
            String specimenName
    );
    List<SpecimenType>
    findBySpecimenNameContainingIgnoreCaseOrSpecimenCodeContainingIgnoreCase(
            String name,
            String code
    );
}
