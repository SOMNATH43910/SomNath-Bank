package com.somnathbank.backend.service;

import com.somnathbank.backend.dto.request.CreateCustomerRequest;
import com.somnathbank.backend.dto.response.CreateCustomerResponse;
import com.somnathbank.backend.dto.response.DashboardResponse;
import com.somnathbank.backend.repository.*;
import com.somnathbank.backend.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final LoanRepository loanRepository;
    private final FixedDepositRepository fdRepository;
    private final NotificationRepository notificationRepository;
    private final TransactionRepository transactionRepository;
    private final PasswordEncoder passwordEncoder;

    // ✅ Admin Dashboard Stats — FIXED
    public DashboardResponse getAdminDashboard() {

        // Total customers (CUSTOMER role wale)
        long totalCustomers = userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() == User.Role.CUSTOMER)
                .count();

        // Pending accounts (PENDING status)
        long pendingAccounts = accountRepository.findAll()
                .stream()
                .filter(a -> a.getStatus() == Account.AccountStatus.PENDING)
                .count();

        // Pending loans (PENDING status)
        long pendingLoans = loanRepository.findAll()
                .stream()
                .filter(l -> l.getStatus() == Loan.LoanStatus.PENDING)
                .count();

        // Total transactions
        long totalTransactions = transactionRepository.count();

        return DashboardResponse.builder()
                .fullName("Admin")
                .role("ADMIN")
                // ✅ Admin-only fields
                .totalCustomers(totalCustomers)
                .pendingAccounts(pendingAccounts)
                .pendingLoans(pendingLoans)
                .totalTransactions(totalTransactions)
                // Account summary
                .totalAccounts(accountRepository.count())
                .totalBalance(accountRepository.findAll()
                        .stream()
                        .mapToDouble(a -> a.getBalance().doubleValue())
                        .sum())
                // Cards
                .totalCards(cardRepository.count())
                .activeCards(cardRepository
                        .findByCardStatus(Card.CardStatus.ACTIVE)
                        .stream().count())
                // Loans
                .totalLoans(loanRepository.count())
                .activeLoans(loanRepository.findAll()
                        .stream()
                        .filter(l -> l.getStatus() == Loan.LoanStatus.ACTIVE)
                        .count())
                .totalLoanAmount(loanRepository.findAll()
                        .stream()
                        .mapToDouble(l -> l.getLoanAmount().doubleValue())
                        .sum())
                // FDs
                .totalFds(fdRepository.count())
                .totalFdAmount(fdRepository.findAll()
                        .stream()
                        .mapToDouble(f -> f.getPrincipalAmount().doubleValue())
                        .sum())
                .build();
    }

    // ✅ Customer Dashboard Stats — unchanged
    public DashboardResponse getCustomerDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        return DashboardResponse.builder()
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role("CUSTOMER")
                .totalAccounts((long) accountRepository.findByUser(user).size())
                .totalBalance(accountRepository.findByUser(user)
                        .stream()
                        .mapToDouble(a -> a.getBalance().doubleValue())
                        .sum())
                .totalCards((long) cardRepository.findByUser(user).size())
                .activeCards(cardRepository.findByUser(user)
                        .stream()
                        .filter(c -> c.getCardStatus() == Card.CardStatus.ACTIVE)
                        .count())
                .totalLoans((long) loanRepository.findByUser(user).size())
                .activeLoans(loanRepository.findByUser(user)
                        .stream()
                        .filter(l -> l.getStatus() == Loan.LoanStatus.ACTIVE)
                        .count())
                .totalLoanAmount(loanRepository.findByUser(user)
                        .stream()
                        .mapToDouble(l -> l.getLoanAmount().doubleValue())
                        .sum())
                .totalFds((long) fdRepository.findByUser(user).size())
                .totalFdAmount(fdRepository.findByUser(user)
                        .stream()
                        .mapToDouble(f -> f.getPrincipalAmount().doubleValue())
                        .sum())
                .unreadNotifications(
                        notificationRepository.countByUserAndIsReadFalse(user))
                .build();
    }

    // ✅ Admin se naya customer + account banao (Branch Visit)
    @Transactional
    public CreateCustomerResponse createCustomerByAdmin(CreateCustomerRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.CUSTOMER)
                .aadharNumber(request.getAadharNumber())
                .panNumber(request.getPanNumber())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .gender(request.getGender())
                .kycStatus(User.KycStatus.VERIFIED)
                .isActive(true)
                .build();

        if (request.getDateOfBirth() != null && !request.getDateOfBirth().isEmpty()) {
            try {
                user.setDob(LocalDate.parse(request.getDateOfBirth(),
                        DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            } catch (Exception ignored) {}
        }

        userRepository.save(user);

        String accountNumber = generateAccountNumber();
        BigDecimal initialDeposit = request.getInitialDeposit() != null
                ? request.getInitialDeposit() : BigDecimal.ZERO;

        Account account = Account.builder()
                .user(user)
                .accountNumber(accountNumber)
                .accountType(Account.AccountType.valueOf(
                        request.getAccountType() != null
                                ? request.getAccountType().toUpperCase() : "SAVINGS"))
                .balance(initialDeposit)
                .status(Account.AccountStatus.ACTIVE)
                .build();

        accountRepository.save(account);

        if (initialDeposit.compareTo(BigDecimal.ZERO) > 0) {
            Transaction txn = Transaction.builder()
                    .fromAccount(accountNumber)
                    .transactionType(Transaction.TransactionType.CREDIT)
                    .amount(initialDeposit)
                    .balanceAfter(initialDeposit)
                    .description("Initial Deposit - Branch Opening")
                    .referenceNumber("INIT" + System.currentTimeMillis())
                    .status(Transaction.TransactionStatus.SUCCESS)
                    .build();
            transactionRepository.save(txn);
        }

        notificationRepository.save(Notification.builder()
                .user(user)
                .title("Welcome to SomNath Bank! 🎉")
                .message("Your " + account.getAccountType() + " account has been created! " +
                        "Account Number: " + accountNumber +
                        (initialDeposit.compareTo(BigDecimal.ZERO) > 0
                                ? " | Opening Balance: ₹" + initialDeposit : ""))
                .type(Notification.NotificationType.SUCCESS)
                .build());

        return CreateCustomerResponse.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .accountNumber(accountNumber)
                .accountType(account.getAccountType().name())
                .balance(account.getBalance())
                .status("ACTIVE")
                .message("Customer account created successfully!")
                .build();
    }

    public List<User> getAllCustomers() {
        return userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() == User.Role.CUSTOMER)
                .collect(Collectors.toList());
    }

    private String generateAccountNumber() {
        String prefix = "SNB";
        String digits = String.format("%09d", new Random().nextInt(1_000_000_000));
        String accountNumber = prefix + digits;
        while (accountRepository.findByAccountNumber(accountNumber).isPresent()) {
            digits = String.format("%09d", new Random().nextInt(1_000_000_000));
            accountNumber = prefix + digits;
        }
        return accountNumber;
    }
}