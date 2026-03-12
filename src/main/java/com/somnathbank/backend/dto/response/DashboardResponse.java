package com.somnathbank.backend.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {

    // User Info
    private String fullName;
    private String email;
    private String role;

    // Account Summary
    private Long totalAccounts;
    private Double totalBalance;

    // Cards
    private Long totalCards;
    private Long activeCards;

    // Loans
    private Long totalLoans;
    private Long activeLoans;
    private Double totalLoanAmount;

    // Fixed Deposits
    private Long totalFds;
    private Double totalFdAmount;

    // Notifications
    private Long unreadNotifications;

    // ✅ Admin-only fields (pehle missing the!)
    private Long totalCustomers;
    private Long pendingAccounts;
    private Long pendingLoans;
    private Long totalTransactions;
}