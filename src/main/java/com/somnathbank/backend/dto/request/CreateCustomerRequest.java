package com.somnathbank.backend.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreateCustomerRequest {
    private String fullName;
    private String email;
    private String phone;
    private String password;
    private String dateOfBirth;
    private String gender;
    private String aadharNumber;
    private String panNumber;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private String accountType;
    private BigDecimal initialDeposit;
}