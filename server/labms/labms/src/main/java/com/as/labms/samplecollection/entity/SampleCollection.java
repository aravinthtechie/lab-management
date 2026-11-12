package com.as.labms.samplecollection.entity;

import com.as.labms.laborder.entity.LabOrderItem;
import com.as.labms.specimen.entity.SpecimenType;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "sample_collections",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_sample_order_item",
                        columnNames = "lab_order_item_id"
                ),
                @UniqueConstraint(
                        name = "uk_sample_code",
                        columnNames = "sample_code"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class SampleCollection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_order_item_id", nullable = false)
    private LabOrderItem labOrderItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specimen_type_id", nullable = false)
    private SpecimenType specimenType;

    @Column(name = "sample_code", nullable = false, length = 50)
    private String sampleCode;

    @Column(name = "collected_by", nullable = false, length = 100)
    private String collectedBy;

    @Column(name = "collection_date_time", nullable = false)
    private LocalDateTime collectionDateTime;

    @Column(name = "specimen_condition", nullable = false, length = 30)
    private String specimenCondition;

    @Column(name = "collection_status", nullable = false, length = 30)
    private String collectionStatus;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {

        createdAt = LocalDateTime.now();

        if (collectionDateTime == null) {
            collectionDateTime = LocalDateTime.now();
        }

        if (collectionStatus == null) {
            collectionStatus = "COLLECTED";
        }
    }
}