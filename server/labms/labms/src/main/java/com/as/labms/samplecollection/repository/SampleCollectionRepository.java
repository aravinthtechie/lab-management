package com.as.labms.samplecollection.repository;

import com.as.labms.samplecollection.entity.SampleCollection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SampleCollectionRepository
        extends JpaRepository<SampleCollection, Long> {

    Optional<SampleCollection> findByLabOrderItem_Id(Long orderItemId);

    boolean existsByLabOrderItem_Id(Long orderItemId);

    List<SampleCollection> findByLabOrderItem_LabOrder_Id(Long orderId);
}