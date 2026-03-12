package com.somnathbank.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class StaffIdCardResponse {
    private Long id;
    private Long staffId;
    private String cardNumber;
    private String staffName;
    private String designation;          // Role shown on card
    private String department;
    private String bloodGroup;
    private String officeAddress;
    private LocalDate issueDate;
    private LocalDate expiryDate;
    private String roomAccess;
    private String status;
    private String blockedReason;
    private String employeeId;           // from Staff entity
    private String email;
    private String phone;
    private String branchName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}