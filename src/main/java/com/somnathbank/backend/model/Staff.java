package com.somnathbank.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "staff")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String employeeId;
    private String fullName;
    private String email;
    private String phone;
    private String designation;
    private String department;
    private String branchName;
    private Double salary;
    private LocalDate joiningDate;
    private String address;

    @Enumerated(EnumType.STRING)
    private StaffStatus status;

    private LocalDateTime createdAt;

    public enum StaffStatus {
        ACTIVE, INACTIVE, ON_LEAVE
    }

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        if (status == null) status = StaffStatus.ACTIVE;
        if (employeeId == null) {
            employeeId = "EMP" + System.currentTimeMillis() % 100000;
        }
    }
}