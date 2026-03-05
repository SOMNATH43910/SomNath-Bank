package com.somnathbank.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name required")
    private String fullName;

    @NotBlank(message = "Email required")
    @Email(message = "Valid email required")
    private String email;

    @NotBlank(message = "Phone required")
    @Size(min = 10, max = 10, message = "Phone must be 10 digits")
    private String phone;

    @NotBlank(message = "Password required")
    @Size(min = 6, message = "Password min 6 characters")
    private String password;

    private LocalDate dob;
    private String gender;
    private String address;
    private String city;
    private String state;
    private String pincode;

    @NotBlank(message = "Aadhar required")
    private String aadharNumber;

    @NotBlank(message = "PAN required")
    private String panNumber;

    // SAVINGS ya CURRENT ya SALARY
    private String accountType;
}