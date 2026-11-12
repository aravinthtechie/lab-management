package com.as.labms.sampledispatch.entity;

import com.as.labms.samplecollection.entity.SampleCollection;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "sample_dispatches",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_dispatch_sample",
                        columnNames = "sample_collection_id"
                ),
                @UniqueConstraint(
                        name = "uk_dispatch_number",
                        columnNames = "dispatch_number"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class SampleDispatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sample_collection_id", nullable = false)
    private SampleCollection sampleCollection;

    @Column(name = "dispatch_number", nullable = false, unique = true, length = 50)
    private String dispatchNumber;

    @Column(name = "dispatched_by", nullable = false, length = 100)
    private String dispatchedBy;

    @Column(nullable = false, length = 150)
    private String destination;

    @Column(name = "dispatch_date_time", nullable = false)
    private LocalDateTime dispatchDateTime;

    @Column(name = "transport_condition", length = 50)
    private String transportCondition;

    @Column(name = "dispatch_status", nullable = false, length = 30)
    private String dispatchStatus;

    @Column(name = "received_by", length = 100)
    private String receivedBy;

    @Column(name = "received_date_time")
    private LocalDateTime receivedDateTime;

    @Column(name = "rejected_by", length = 100)
    private String rejectedBy;

    @Column(name = "rejected_date_time")
    private LocalDateTime rejectedDateTime;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();

        if (dispatchDateTime == null) {
            dispatchDateTime = LocalDateTime.now();
        }

        if (dispatchStatus == null) {
            dispatchStatus = "DISPATCHED";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}