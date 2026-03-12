package com.somnathbank.backend.dto.request;

import lombok.Data;

@Data
public class StaffIdCardRequest {
    private Long staffId;
    private String bloodGroup;       // A+, B+, O+, AB+, A-, B-, O-, AB-
    private String officeAddress;    // Branch / office address
    private String roomAccess;       // Comma separated: SERVER_ROOM,VAULT,MANAGER_CABIN
}