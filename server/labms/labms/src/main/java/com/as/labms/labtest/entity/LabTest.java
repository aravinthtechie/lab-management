package com.as.labms.labtest.entity;

import com.as.labms.labtestcategory.entity.LabTestCategory;
import com.as.labms.specimen.entity.SpecimenType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "lab_tests",
        indexes = {
                @Index(name = "idx_lab_test_name", columnList = "test_name"),
                @Index(name = "idx_lab_test_category", columnList = "test_category_id"),
                @Index(name = "idx_lab_test_specimen", columnList = "specimen_type_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_lab_test_code",
                        columnNames = "test_code"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class LabTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "test_code", nullable = false, length = 50)
    private String testCode;

    @Column(name = "test_name", nullable = false, length = 150)
    private String testName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_category_id", nullable = false)
    private LabTestCategory category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specimen_type_id", nullable = false)
    private SpecimenType specimenType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "turnaround_time", nullable = false)
    private Integer turnaroundTime;

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

        if (isActive == null) {
            isActive = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}