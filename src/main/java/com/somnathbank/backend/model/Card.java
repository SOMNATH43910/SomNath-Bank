package com.somnathbank.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Kaun sa customer hai
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Kaun sa account linked hai
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(unique = true, nullable = false)
    private String cardNumber;      // 16 digit card number

    @Enumerated(EnumType.STRING)
    private CardType cardType;      // DEBIT ya CREDIT

    @Enumerated(EnumType.STRING)
    private CardNetwork cardNetwork = CardNetwork.RUPAY;

    private LocalDate expiryDate;   // Card expiry date
    private String cvv;             // 3 digit CVV

    // Sirf credit card ke liye, debit card mein 0 rahega
    private BigDecimal creditLimit = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private CardStatus cardStatus = CardStatus.PENDING;

    private LocalDateTime appliedAt;

    @PrePersist
    protected void onCreate() {
        appliedAt = LocalDateTime.now();
    }

    public enum CardType {
        DEBIT, CREDIT
    }

    public enum CardNetwork {
        VISA, MASTERCARD, RUPAY
    }

    public enum CardStatus {
        PENDING, ACTIVE, BLOCKED
    }
}