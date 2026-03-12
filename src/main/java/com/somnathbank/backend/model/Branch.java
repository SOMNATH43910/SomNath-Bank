package com.somnathbank.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "branches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Branch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String branchName;
    private String branchCode;
    private String ifscCode;
    private String address;
    private String city;
    private String state;
    private String phone;
    private String managerName;
    private Integer totalStaff;

    @Enumerated(EnumType.STRING)
    private BranchStatus status;

    private LocalDateTime createdAt;

    public enum BranchStatus {
        ACTIVE, INACTIVE
    }

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) status = BranchStatus.ACTIVE;
    }
}