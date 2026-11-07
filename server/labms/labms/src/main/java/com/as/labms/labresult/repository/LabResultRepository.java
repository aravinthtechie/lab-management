package com.as.labms.labresult.repository;

import com.as.labms.labresult.entity.LabResult;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LabResultRepository
        extends JpaRepository<LabResult, Long> {

    boolean existsByLabOrderItem_IdAndTestParameter_Id(
            Long orderItemId,
            Long testParameterId
    );

    Optional<LabResult> findByLabOrderItem_IdAndTestParameter_Id(
            Long orderItemId,
            Long testParameterId
    );

    List<LabResult> findByLabOrderItem_Id(Long orderItemId);

    List<LabResult> findByLabOrderItem_LabOrder_Id(Long orderId);

    List<LabResult> findByResultStatusOrderByResultDateTimeAsc(
            String resultStatus
    );
}