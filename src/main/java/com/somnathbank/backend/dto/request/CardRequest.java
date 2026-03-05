package com.somnathbank.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CardRequest {

    @NotBlank(message = "Account number required")
    private String accountNumber;

    @NotBlank(message = "Card type required")
    private String cardType; // DEBIT, CREDIT

    @NotBlank(message = "Card network required")
    private String cardNetwork; // VISA, MASTERCARD, RUPAY
}