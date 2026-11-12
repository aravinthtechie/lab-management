
package com.as.labms.laborder.entity;

import com.as.labms.labtest.entity.LabTest;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "lab_order_items",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_order_test",
                        columnNames = {"lab_order_id", "lab_test_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class LabOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_order_id", nullable = false)
    private LabOrder labOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_test_id", nullable = false)
    private LabTest labTest;

    @Column(name = "test_name", nullable = false, length = 150)
    private String testName;

    @Column(name = "test_code", nullable = false, length = 50)
    private String testCode;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_status", nullable = false, length = 30)
    private OrderItemStatus itemStatus;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();

        if (itemStatus == null) {
            itemStatus = OrderItemStatus.PENDING;
        }
    }
}
