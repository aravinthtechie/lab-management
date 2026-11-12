package com.as.labms.referencerange.repository;

import com.as.labms.referencerange.entity.ReferenceRange;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReferenceRangeRepository
        extends JpaRepository<ReferenceRange, Long> {

    List<ReferenceRange> findByTestParameter_IdAndIsActiveTrue(
            Long testParameterId
    );

    List<ReferenceRange> findByIsActiveTrue();
}