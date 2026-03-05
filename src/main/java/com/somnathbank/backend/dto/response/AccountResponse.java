package com.somnathbank.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountResponse {
    private Long id;
    private String accountNumber;
    private String accountType;
    private BigDecimal balance;
    private String ifscCode;
    private String branchName;
    private String status;
    private String ownerName;
    private String message;
    private Boolean success;
}