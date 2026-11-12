package com.as.labms.laborder.repository;

import com.as.labms.laborder.entity.LabOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LabOrderRepository
        extends JpaRepository<LabOrder, Long> {

    Optional<LabOrder> findByOrderNumber(String orderNumber);

    List<LabOrder> findByPatient_IdOrderByOrderDateDesc(Long patientId);

}