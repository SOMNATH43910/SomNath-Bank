package com.somnathbank.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "fixed_deposits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FixedDeposit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Kaun sa customer
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Kaun sa account se FD kiya
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(unique = true, nullable = false)
    private String fdNumber;            // Unique FD number

    private BigDecimal principalAmount; // Kitna paisa daala
    private BigDecimal interestRate;    // Interest rate (e.g. 6.5%)
    private Integer tenureMonths;       // Kitne mahine ke liye
    private BigDecimal maturityAmount;  // Maturity pe kitna milega

    private LocalDate startDate;        // FD start date
    private LocalDate maturityDate;     // FD khatam hone ki date

    @Enumerated(EnumType.STRING)
    private FdStatus status = FdStatus.ACTIVE;

    public enum FdStatus {
        ACTIVE,   // Chal raha hai
        MATURED,  // Time complete ho gaya
        BROKEN    // Beech mein toda
    }
}