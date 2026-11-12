package com.as.labms.testparameter.entity;

import com.as.labms.labtest.entity.LabTest;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "test_parameters",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_test_parameter_code",
                        columnNames = {"lab_test_id", "parameter_code"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class TestParameter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_test_id", nullable = false)
    private LabTest labTest;

    @Column(name = "parameter_code", nullable = false, length = 50)
    private String parameterCode;

    @Column(name = "parameter_name", nullable = false, length = 150)
    private String parameterName;

    @Column(length = 50)
    private String unit;

    @Column(name = "data_type", nullable = false, length = 30)
    private String dataType;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}