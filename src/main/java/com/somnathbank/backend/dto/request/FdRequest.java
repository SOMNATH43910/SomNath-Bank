package com.somnathbank.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class FdRequest {

    @NotBlank(message = "Account number required")
    private String accountNumber;

    @NotNull(message = "Amount required")
    @Min(value = 1000, message = "Minimum FD amount is ₹1000")
    private Double amount;

    @NotNull(message = "Tenure required")
    @Min(value = 1, message = "Minimum tenure is 1 year")
    @Max(value = 10, message = "Maximum tenure is 10 years")
    private Integer tenureYears;
}