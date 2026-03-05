package com.somnathbank.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "loans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LoanType loanType;

    @Column(nullable = false)
    private BigDecimal loanAmount;

    private BigDecimal interestRate;
    private Integer tenureMonths;

    // EMI auto calculate hogi service mein
    private BigDecimal emiAmount;

    @Builder.Default
    private BigDecimal disbursedAmount = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal outstandingAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private LoanStatus status = LoanStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String purpose;

    private LocalDateTime appliedAt;
    private LocalDateTime approvedAt; // null rahega jab tak approve na ho

    @PrePersist
    protected void onCreate() {
        this.appliedAt = LocalDateTime.now();
    }

    public enum LoanType {
        HOME, CAR, PERSONAL, EDUCATION, BUSINESS
    }

    public enum LoanStatus {
        PENDING, APPROVED, REJECTED, ACTIVE, CLOSED
    }
}