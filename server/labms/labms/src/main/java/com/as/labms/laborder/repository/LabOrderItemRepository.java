package com.as.labms.laborder.repository;

import com.as.labms.laborder.entity.LabOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LabOrderItemRepository
        extends JpaRepository<LabOrderItem, Long> {
}