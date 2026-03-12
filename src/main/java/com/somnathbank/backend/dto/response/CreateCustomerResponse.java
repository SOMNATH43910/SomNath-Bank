package com.somnathbank.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class CreateCustomerResponse {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String accountNumber;
    private String accountType;
    private BigDecimal balance;
    private String status;
    private String message;
}