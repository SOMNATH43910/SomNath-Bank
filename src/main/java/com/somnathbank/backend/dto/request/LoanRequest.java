package com.somnathbank.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class LoanRequest {

    @NotBlank(message = "Account number required")
    private String accountNumber;

    @NotBlank(message = "Loan type required")
    private String loanType; // HOME, CAR, PERSONAL, EDUCATION, BUSINESS

    @NotNull(message = "Amount required")
    @DecimalMin(value = "1000.0", message = "Minimum loan amount is 1000")
    private BigDecimal loanAmount;

    @NotNull(message = "Tenure required")
    @Min(value = 1, message = "Minimum tenure is 1 month")
    @Max(value = 360, message = "Maximum tenure is 360 months")
    private Integer tenureMonths;

    private String purpose;
}