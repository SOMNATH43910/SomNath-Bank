package com.somnathbank.backend.dto.response;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class FdResponse {
    private Long id;
    private String customerName;
    private String customerEmail;
    private String accountNumber;
    private Double principalAmount;
    private Double interestRate;
    private Integer tenureYears;
    private Double maturityAmount;
    private LocalDate startDate;
    private LocalDate maturityDate;
    private String status;
    private LocalDateTime createdAt;
}
