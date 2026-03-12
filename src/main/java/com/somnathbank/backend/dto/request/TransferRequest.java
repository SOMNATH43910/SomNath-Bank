package com.somnathbank.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransferRequest {

    @NotBlank(message = "From account required")
    private String fromAccountNumber; // ✅ Frontend se match

    @NotBlank(message = "To account required")
    private String toAccountNumber;   // ✅ Frontend se match

    @NotNull(message = "Amount required")
    @DecimalMin(value = "1.0", message = "Minimum transfer amount is 1")
    private BigDecimal amount;

    private String description;

    private String mode; // ✅ Optional - @NotBlank hataya
}