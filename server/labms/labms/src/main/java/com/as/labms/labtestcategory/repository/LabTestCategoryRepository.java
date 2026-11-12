
package com.as.labms.labtestcategory.repository;

import com.as.labms.labtestcategory.entity.LabTestCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LabTestCategoryRepository
        extends JpaRepository<LabTestCategory, Long> {

    boolean existsByCategoryCodeIgnoreCase(String categoryCode);

    Optional<LabTestCategory> findByCategoryCodeIgnoreCase(
            String categoryCode
    );

    List<LabTestCategory> findByIsActiveTrue();

    List<LabTestCategory> findByCategoryNameContainingIgnoreCase(
            String categoryName
    );
}
