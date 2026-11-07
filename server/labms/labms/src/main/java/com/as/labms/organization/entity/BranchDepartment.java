package com.as.labms.organization.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "branch_departments",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_branch_department",
                        columnNames = {"branch_id", "department_id"}
                )
        }
)
public class BranchDepartment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    public BranchDepartment() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }

    public Department getDepartment() { return department; }
    public void setDepartment(Department department) {
        this.department = department;
    }

    public Boolean getIsAvailable() { return isAvailable; }
    public void setIsAvailable(Boolean available) {
        isAvailable = available;
    }
}