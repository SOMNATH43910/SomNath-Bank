package com.somnathbank.backend.service;

import com.somnathbank.backend.dto.request.LoanRequest;
import com.somnathbank.backend.dto.response.LoanResponse;
import com.somnathbank.backend.exception.ResourceNotFoundException;
import com.somnathbank.backend.model.*;
import com.somnathbank.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    // Customer: loan apply karo
    public LoanResponse applyLoan(LoanRequest request, String email) {
        User user = getUserByEmail(email);

        Account account = accountRepository
                .findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Account not found!"));

        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new RuntimeException("Account is not active!");
        }

        // Interest rate loan type pe depend karta hai
        BigDecimal interestRate = getInterestRate(
                request.getLoanType());

        // EMI calculate karo
        BigDecimal emiAmount = calculateEmi(
                request.getLoanAmount(),
                interestRate,
                request.getTenureMonths()
        );

        Loan loan = Loan.builder()
                .user(user)
                .account(account)
                .loanType(Loan.LoanType
                        .valueOf(request.getLoanType().toUpperCase()))
                .loanAmount(request.getLoanAmount())
                .interestRate(interestRate)
                .tenureMonths(request.getTenureMonths())
                .emiAmount(emiAmount)
                .outstandingAmount(request.getLoanAmount())
                .status(Loan.LoanStatus.PENDING)
                .purpose(request.getPurpose())
                .build();

        loanRepository.save(loan);

        // Notification
        notificationRepository.save(Notification.builder()
                .user(user)
                .title("Loan Application Submitted!")
                .message("Your " + request.getLoanType() +
                        " loan application of ₹" +
                        request.getLoanAmount() +
                        " has been submitted. Waiting for approval.")
                .type(Notification.NotificationType.INFO)
                .build());

        return mapToResponse(loan);
    }

    // Customer: apne loans dekho
    public List<LoanResponse> getMyLoans(String email) {
        User user = getUserByEmail(email);
        return loanRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Admin: saare loans dekho
    public List<LoanResponse> getAllLoans() {
        return loanRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Admin: loan approve karo
    public LoanResponse approveLoan(Long loanId) {
        Loan loan = getLoanById(loanId);
        loan.setStatus(Loan.LoanStatus.APPROVED);

        // Loan amount account mein add karo
        Account account = loan.getAccount();
        account.setBalance(
                account.getBalance().add(loan.getLoanAmount()));
        accountRepository.save(account);

        loan.setDisbursedAmount(loan.getLoanAmount());
        loan.setStatus(Loan.LoanStatus.ACTIVE);
        loanRepository.save(loan);

        // Notification
        notificationRepository.save(Notification.builder()
                .user(loan.getUser())
                .title("Loan Approved! 🎉")
                .message("Your " + loan.getLoanType() +
                        " loan of ₹" + loan.getLoanAmount() +
                        " has been approved! EMI: ₹" +
                        loan.getEmiAmount() + "/month")
                .type(Notification.NotificationType.SUCCESS)
                .build());

        return mapToResponse(loan);
    }

    // Admin: loan reject karo
    public LoanResponse rejectLoan(Long loanId) {
        Loan loan = getLoanById(loanId);
        loan.setStatus(Loan.LoanStatus.REJECTED);
        loanRepository.save(loan);

        notificationRepository.save(Notification.builder()
                .user(loan.getUser())
                .title("Loan Rejected ❌")
                .message("Your " + loan.getLoanType() +
                        " loan application has been rejected.")
                .type(Notification.NotificationType.WARNING)
                .build());

        return mapToResponse(loan);
    }

    // =====================
    // Helper Methods
    // =====================

    // EMI Formula: P * R * (1+R)^N / ((1+R)^N - 1)
    private BigDecimal calculateEmi(BigDecimal principal,
                                    BigDecimal annualRate,
                                    int tenureMonths) {
        BigDecimal monthlyRate = annualRate
                .divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP);

        BigDecimal onePlusR = BigDecimal.ONE.add(monthlyRate);
        BigDecimal power = onePlusR.pow(tenureMonths);

        BigDecimal numerator = principal
                .multiply(monthlyRate)
                .multiply(power);
        BigDecimal denominator = power.subtract(BigDecimal.ONE);

        return numerator
                .divide(denominator, 2, RoundingMode.HALF_UP);
    }

    // Loan type pe interest rate
    private BigDecimal getInterestRate(String loanType) {
        return switch (loanType.toUpperCase()) {
            case "HOME" -> BigDecimal.valueOf(8.5);
            case "CAR" -> BigDecimal.valueOf(9.0);
            case "EDUCATION" -> BigDecimal.valueOf(7.5);
            case "BUSINESS" -> BigDecimal.valueOf(11.0);
            default -> BigDecimal.valueOf(12.0); // PERSONAL
        };
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found!"));
    }

    private Loan getLoanById(Long id) {
        return loanRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Loan not found!"));
    }

    private LoanResponse mapToResponse(Loan loan) {

        // Tenure ko readable format mein convert karo
        int months = loan.getTenureMonths();
        int years = months / 12;
        int remainingMonths = months % 12;

        String tenureInYears;
        if (years == 0) {
            tenureInYears = remainingMonths + " Months";
        } else if (remainingMonths == 0) {
            tenureInYears = years + " Year(s)";
        } else {
            tenureInYears = years + " Year(s) " +
                    remainingMonths + " Months";
        }

        return LoanResponse.builder()
                .id(loan.getId())
                // Customer details
                .customerName(loan.getUser().getFullName())
                .customerEmail(loan.getUser().getEmail())
                .customerPhone(loan.getUser().getPhone())
                // Account
                .accountNumber(loan.getAccount().getAccountNumber())
                // Loan details
                .loanType(loan.getLoanType().name())
                .loanAmount(loan.getLoanAmount())
                .interestRate(loan.getInterestRate())
                .tenureMonths(loan.getTenureMonths())
                .tenureInYears(tenureInYears)
                .emiAmount(loan.getEmiAmount())
                .disbursedAmount(loan.getDisbursedAmount())
                .outstandingAmount(loan.getOutstandingAmount())
                .status(loan.getStatus().name())
                .purpose(loan.getPurpose())
                .appliedAt(loan.getAppliedAt())
                .approvedAt(loan.getApprovedAt())
                .build();
    }
}