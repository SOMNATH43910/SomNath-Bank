package com.somnathbank.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fromAccount;
    private String toAccount;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType transactionType;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TransactionMode mode = TransactionMode.IMPS;

    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.SUCCESS;

    @Column(unique = true)
    private String referenceNumber;

    private BigDecimal balanceAfter; // ✅ Add kiya

    private LocalDateTime transactionDate;

    @PrePersist
    protected void onCreate() {
        this.transactionDate = LocalDateTime.now();
    }

    public enum TransactionType {
        CREDIT, DEBIT
    }

    public enum TransactionMode {
        NEFT, IMPS, UPI, CASH, ATM
    }

    public enum TransactionStatus {
        SUCCESS, FAILED, PENDING
    }
}
