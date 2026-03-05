package com.somnathbank.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransferRequest {

    @NotBlank(message = "From account required")
    private String fromAccount;

    @NotBlank(message = "To account required")
    private String toAccount;

    @NotNull(message = "Amount required")
    @DecimalMin(value = "1.0", message = "Minimum transfer amount is 1")
    private BigDecimal amount;

    private String description;

    @NotBlank(message = "Transfer mode required")
    private String mode; // NEFT, IMPS, UPI
}