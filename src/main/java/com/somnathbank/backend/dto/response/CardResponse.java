package com.somnathbank.backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardResponse {
    private Long id;
    private String customerName;
    private String customerEmail;
    private String accountNumber;
    private String cardNumber;      // Masked: **** **** **** 1234
    private String cardType;        // DEBIT / CREDIT
    private String cardNetwork;     // VISA / MASTERCARD / RUPAY
    private LocalDate expiryDate;
    private BigDecimal creditLimit; // Only for credit card
    private String cardStatus;
}