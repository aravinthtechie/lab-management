
package com.as.labms.labtest.repository;

import com.as.labms.labtest.entity.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LabTestRepository
        extends JpaRepository<LabTest, Long> {

    boolean existsByTestCodeIgnoreCase(String testCode);

    Optional<LabTest> findByTestCodeIgnoreCase(String testCode);

    List<LabTest> findByIsActiveTrue();

    List<LabTest> findByCategory_Id(Long categoryId);

    List<LabTest> findByCategory_IdAndIsActiveTrue(Long categoryId);

    List<LabTest> findByTestNameContainingIgnoreCase(String testName);
}
