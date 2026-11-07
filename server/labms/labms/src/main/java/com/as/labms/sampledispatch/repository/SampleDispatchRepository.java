package com.as.labms.sampledispatch.repository;

import com.as.labms.sampledispatch.entity.SampleDispatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SampleDispatchRepository
        extends JpaRepository<SampleDispatch, Long> {

    boolean existsBySampleCollection_Id(Long sampleCollectionId);

    Optional<SampleDispatch> findBySampleCollection_Id(Long sampleCollectionId);

    List<SampleDispatch> findAllByOrderByCreatedAtDesc();
}