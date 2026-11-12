package com.as.labms.labresult.entity;

import com.as.labms.laborder.entity.LabOrderItem;
import com.as.labms.testparameter.entity.TestParameter;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "lab_results",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_result_order_item_parameter",
                        columnNames = {"lab_order_item_id", "test_parameter_id"}
                )
        },
        indexes = {
                @Index(name = "idx_result_order_item", columnList = "lab_order_item_id"),
                @Index(name = "idx_result_parameter", columnList = "test_parameter_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
public class LabResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_order_item_id", nullable = false)
    private LabOrderItem labOrderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_parameter_id", nullable = false)
    private TestParameter testParameter;

    @Column(name = "result_value", nullable = false, length = 100)
    private String resultValue;

    @Column(name = "unit", length = 50)
    private String unit;

    @Column(length = 500)
    private String remarks;

    @Column(name = "entered_by", nullable = false, length = 100)
    private String enteredBy;

    @Column(name = "result_date_time", nullable = false)
    private LocalDateTime resultDateTime;

    @Column(name = "result_status", nullable = false, length = 30)
    private String resultStatus;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (resultDateTime == null) {
            resultDateTime = LocalDateTime.now();
        }

        if (resultStatus == null) {
            resultStatus = "PENDING_VERIFICATION";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    @Column(name = "verified_by", length = 100)
    private String verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "verification_remarks", columnDefinition = "TEXT")
    private String verificationRemarks;
}