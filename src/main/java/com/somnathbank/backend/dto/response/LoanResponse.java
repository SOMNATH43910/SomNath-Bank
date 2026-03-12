package com.somnathbank.backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanResponse {
    private Long id;

    // Customer Details ← NAYA ADD KIYA
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    // Account Details ← NAYA ADD KIYA
    private String accountNumber;

    // Loan Details
    private String loanType;
    private BigDecimal loanAmount;
    private BigDecimal interestRate;
    private Integer tenureMonths;
    private String tenureInYears;      // ← "1 Year" ya "2 Years 6 Months"
    private BigDecimal emiAmount;
    private BigDecimal disbursedAmount;
    private BigDecimal outstandingAmount;
    private String status;
    private String purpose;
    private LocalDateTime appliedAt;
    private LocalDateTime approvedAt;
    private BigDecimal paidAmount;
}