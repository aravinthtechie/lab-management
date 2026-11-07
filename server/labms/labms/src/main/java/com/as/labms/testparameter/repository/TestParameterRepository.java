package com.as.labms.testparameter.repository;

import com.as.labms.testparameter.entity.TestParameter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestParameterRepository
        extends JpaRepository<TestParameter, Long> {

    List<TestParameter> findByLabTest_Id(Long labTestId);

    List<TestParameter> findByLabTest_IdAndIsActiveTrue(Long labTestId);

    boolean existsByLabTest_IdAndParameterCodeIgnoreCase(
            Long labTestId,
            String parameterCode
    );
}