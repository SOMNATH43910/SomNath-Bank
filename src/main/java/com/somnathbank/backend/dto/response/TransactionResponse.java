package com.somnathbank.backend.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private String fromAccount;
    private String toAccount;
    private BigDecimal amount;
    private String transactionType;
    private String mode;
    private String description;
    private String status;
    private String referenceNumber;
    private LocalDateTime transactionDate;
    private Boolean success;
    private String message;
}