package com.somnathbank.backend.service;

import com.somnathbank.backend.dto.request.LoanRequest;
import com.somnathbank.backend.dto.response.LoanResponse;
import com.somnathbank.backend.exception.ResourceNotFoundException;
import com.somnathbank.backend.model.*;
import com.somnathbank.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository        loanRepository;
    private final AccountRepository     accountRepository;
    private final UserRepository        userRepository;
    private final NotificationRepository notificationRepository;
    private final TransactionRepository transactionRepository;

    /* ─────────────────────────────────────────────────────────────
       Customer: loan apply karo
    ───────────────────────────────────────────────────────────── */
    public LoanResponse applyLoan(LoanRequest request, String email) {

        User user = getUserByEmail(email);

        Account account = accountRepository
                .findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found!"));

        if (account.getStatus() != Account.AccountStatus.ACTIVE)
            throw new RuntimeException("Account is not active!");

        BigDecimal interestRate = getInterestRate(request.getLoanType());
        BigDecimal emiAmount    = calculateEmi(
                request.getLoanAmount(), interestRate, request.getTenureMonths());

        Loan loan = Loan.builder()
                .user(user)
                .account(account)
                .loanType(Loan.LoanType.valueOf(request.getLoanType().toUpperCase()))
                .loanAmount(request.getLoanAmount())
                .interestRate(interestRate)
                .tenureMonths(request.getTenureMonths())
                .emiAmount(emiAmount)
                .outstandingAmount(request.getLoanAmount())
                .status(Loan.LoanStatus.PENDING)
                .purpose(request.getPurpose())
                .build();

        loanRepository.save(loan);

        notificationRepository.save(Notification.builder()
                .user(user)
                .title("Loan Application Submitted!")
                .message("Your " + request.getLoanType()
                        + " loan application of ₹" + request.getLoanAmount()
                        + " has been submitted. Waiting for approval.")
                .type(Notification.NotificationType.INFO)
                .build());

        return mapToResponse(loan);
    }

    /* ─────────────────────────────────────────────────────────────
       Customer: apne loans dekho
    ───────────────────────────────────────────────────────────── */
    public List<LoanResponse> getMyLoans(String email) {
        User user = getUserByEmail(email);
        return loanRepository.findByUser(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ─────────────────────────────────────────────────────────────
       Admin: saare loans dekho
    ───────────────────────────────────────────────────────────── */
    public List<LoanResponse> getAllLoans() {
        return loanRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /* ─────────────────────────────────────────────────────────────
       Admin: loan approve karo
       BUG FIX #1 — approvedAt kabhi set nahi ho raha tha
    ───────────────────────────────────────────────────────────── */
    @Transactional
    public LoanResponse approveLoan(Long loanId) {

        Loan    loan    = getLoanById(loanId);
        Account account = loan.getAccount();

        // Disbursed amount account mein add karo
        account.setBalance(account.getBalance().add(loan.getLoanAmount()));
        accountRepository.save(account);

        loan.setDisbursedAmount(loan.getLoanAmount());
        loan.setStatus(Loan.LoanStatus.ACTIVE);
        loan.setApprovedAt(LocalDateTime.now());   // ✅ FIX #1 — pehle yeh line missing thi

        loanRepository.save(loan);

        // Disbursement transaction record
        transactionRepository.save(Transaction.builder()
                .fromAccount(null)                          // bank se aa raha hai
                .toAccount(account.getAccountNumber())      // customer ke account mein
                .transactionType(Transaction.TransactionType.CREDIT)
                .amount(loan.getLoanAmount())
                .description("Loan Disbursement - "
                        + loan.getLoanType() + " Loan #" + loan.getId())
                .status(Transaction.TransactionStatus.SUCCESS)
                .build());

        notificationRepository.save(Notification.builder()
                .user(loan.getUser())
                .title("Loan Approved! 🎉")
                .message("Your " + loan.getLoanType()
                        + " loan of ₹" + loan.getLoanAmount()
                        + " has been approved and disbursed! EMI: ₹"
                        + loan.getEmiAmount() + "/month")
                .type(Notification.NotificationType.SUCCESS)
                .build());

        return mapToResponse(loan);
    }

    /* ─────────────────────────────────────────────────────────────
       Admin: loan reject karo
    ───────────────────────────────────────────────────────────── */
    @Transactional
    public LoanResponse rejectLoan(Long loanId) {

        Loan loan = getLoanById(loanId);
        loan.setStatus(Loan.LoanStatus.REJECTED);
        loanRepository.save(loan);

        notificationRepository.save(Notification.builder()
                .user(loan.getUser())
                .title("Loan Rejected ❌")
                .message("Your " + loan.getLoanType()
                        + " loan application has been rejected.")
                .type(Notification.NotificationType.WARNING)
                .build());

        return mapToResponse(loan);
    }

    /* ─────────────────────────────────────────────────────────────
       Customer: EMI repay karo
       BUG FIX #2 — Transaction record save nahi hota tha
    ───────────────────────────────────────────────────────────── */
    @Transactional
    public LoanResponse repayLoan(Long loanId, BigDecimal amount, String email) {

        Loan loan = getLoanById(loanId);

        if (!loan.getUser().getEmail().equals(email))
            throw new RuntimeException("Unauthorized!");

        if (loan.getStatus() != Loan.LoanStatus.ACTIVE)
            throw new RuntimeException("Loan is not active!");

        Account account = loan.getAccount();

        if (account.getBalance().compareTo(amount) < 0)
            throw new RuntimeException("Insufficient balance!");

        // Account se paisa kato
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);

        // ✅ FIX #2 — EMI ka transaction record save karo
        // (Transaction.fromAccount / toAccount are String fields)
        transactionRepository.save(Transaction.builder()
                .fromAccount(account.getAccountNumber())   // customer ka account
                .toAccount(null)                           // bank ko ja raha hai
                .transactionType(Transaction.TransactionType.DEBIT)
                .amount(amount)
                .description("EMI Payment - "
                        + loan.getLoanType() + " Loan #" + loan.getId())
                .status(Transaction.TransactionStatus.SUCCESS)
                .build());

        // Outstanding update karo
        BigDecimal currentPaid        = loan.getPaidAmount() != null
                ? loan.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal currentOutstanding = loan.getOutstandingAmount() != null
                ? loan.getOutstandingAmount() : loan.getLoanAmount();

        loan.setPaidAmount(currentPaid.add(amount));
        BigDecimal newOutstanding = currentOutstanding.subtract(amount);

        // Agar poora pay ho gaya → CLOSED
        if (newOutstanding.compareTo(BigDecimal.ZERO) <= 0) {
            loan.setOutstandingAmount(BigDecimal.ZERO);
            loan.setStatus(Loan.LoanStatus.CLOSED);

            notificationRepository.save(Notification.builder()
                    .user(loan.getUser())
                    .title("Loan Fully Paid! 🎉")
                    .message("Congratulations! Your " + loan.getLoanType()
                            + " loan has been fully repaid!")
                    .type(Notification.NotificationType.SUCCESS)
                    .build());
        } else {
            loan.setOutstandingAmount(newOutstanding);

            notificationRepository.save(Notification.builder()
                    .user(loan.getUser())
                    .title("EMI Payment Successful! ✅")
                    .message("₹" + amount + " paid for " + loan.getLoanType()
                            + " loan. Outstanding: ₹" + newOutstanding)
                    .type(Notification.NotificationType.SUCCESS)
                    .build());
        }

        loanRepository.save(loan);
        return mapToResponse(loan);
    }

    /* ─────────────────────────────────────────────────────────────
       Helper Methods
    ───────────────────────────────────────────────────────────── */

    private BigDecimal calculateEmi(BigDecimal principal,
                                    BigDecimal annualRate,
                                    int tenureMonths) {
        BigDecimal monthlyRate = annualRate
                .divide(BigDecimal.valueOf(1200), 10, RoundingMode.HALF_UP);
        BigDecimal onePlusR  = BigDecimal.ONE.add(monthlyRate);
        BigDecimal power     = onePlusR.pow(tenureMonths);
        BigDecimal numerator = principal.multiply(monthlyRate).multiply(power);
        BigDecimal denominator = power.subtract(BigDecimal.ONE);
        return numerator.divide(denominator, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal getInterestRate(String loanType) {
        return switch (loanType.toUpperCase()) {
            case "HOME"      -> BigDecimal.valueOf(8.5);
            case "CAR"       -> BigDecimal.valueOf(9.0);
            case "EDUCATION" -> BigDecimal.valueOf(7.5);
            case "BUSINESS"  -> BigDecimal.valueOf(11.0);
            default          -> BigDecimal.valueOf(12.0); // PERSONAL
        };
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found!"));
    }

    private Loan getLoanById(Long id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Loan not found!"));
    }

    private LoanResponse mapToResponse(Loan loan) {

        int months           = loan.getTenureMonths();
        int years            = months / 12;
        int remainingMonths  = months % 12;

        String tenureInYears;
        if (years == 0) {
            tenureInYears = remainingMonths + " Months";
        } else if (remainingMonths == 0) {
            tenureInYears = years + " Year(s)";
        } else {
            tenureInYears = years + " Year(s) " + remainingMonths + " Months";
        }

        return LoanResponse.builder()
                .id(loan.getId())
                .customerName(loan.getUser().getFullName())
                .customerEmail(loan.getUser().getEmail())
                .customerPhone(loan.getUser().getPhone())
                .accountNumber(loan.getAccount().getAccountNumber())
                .loanType(loan.getLoanType().name())
                .loanAmount(loan.getLoanAmount())
                .interestRate(loan.getInterestRate())
                .tenureMonths(loan.getTenureMonths())
                .tenureInYears(tenureInYears)
                .emiAmount(loan.getEmiAmount())
                .disbursedAmount(loan.getDisbursedAmount())
                .outstandingAmount(loan.getOutstandingAmount())
                .paidAmount(loan.getPaidAmount())
                .status(loan.getStatus().name())
                .purpose(loan.getPurpose())
                .appliedAt(loan.getAppliedAt())
                .approvedAt(loan.getApprovedAt())
                .build();
    }
}