package com.somnathbank.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(unique = true, nullable = false)
    private String accountNumber;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AccountType accountType = AccountType.SAVINGS;

    // money ke liye hamesha BigDecimal use karo, double/float nahi
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @Builder.Default
    private String ifscCode = "SOMNATH0001";

    @Builder.Default
    private String branchName = "Main Branch";

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private AccountStatus status = AccountStatus.PENDING;

    private LocalDateTime openedAt;

    @PrePersist
    protected void onCreate() {
        this.openedAt = LocalDateTime.now();
    }

    public enum AccountType {
        SAVINGS, CURRENT, SALARY
    }

    public enum AccountStatus {
        PENDING, ACTIVE, BLOCKED, CLOSED
    }
}