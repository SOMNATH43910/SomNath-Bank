package com.somnathbank.backend.service;

import com.somnathbank.backend.dto.request.TransferRequest;
import com.somnathbank.backend.dto.response.TransactionResponse;
import com.somnathbank.backend.exception.ResourceNotFoundException;
import com.somnathbank.backend.model.*;
import com.somnathbank.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // =====================
    // FUND TRANSFER
    // =====================
    @Transactional
    public TransactionResponse transfer(TransferRequest request, String email) {

        // From account dhundho
        Account fromAccount = accountRepository
                .findByAccountNumber(request.getFromAccount())
                .orElseThrow(() ->
                        new ResourceNotFoundException("From account not found!"));

        // To account dhundho
        Account toAccount = accountRepository
                .findByAccountNumber(request.getToAccount())
                .orElseThrow(() ->
                        new ResourceNotFoundException("To account not found!"));

        // Account active hai?
        if (fromAccount.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new RuntimeException("Your account is not active!");
        }

        if (toAccount.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new RuntimeException("Recipient account is not active!");
        }

        // Same account transfer nahi hoga
        if (fromAccount.getAccountNumber()
                .equals(toAccount.getAccountNumber())) {
            throw new RuntimeException(
                    "Cannot transfer to same account!");
        }

        // Balance check karo
        if (fromAccount.getBalance()
                .compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance!");
        }

        // Balance update karo
        fromAccount.setBalance(
                fromAccount.getBalance().subtract(request.getAmount()));
        toAccount.setBalance(
                toAccount.getBalance().add(request.getAmount()));

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        // Reference number generate karo
        String referenceNumber = "TXN" +
                UUID.randomUUID().toString()
                        .replace("-", "")
                        .substring(0, 12)
                        .toUpperCase();

        // Transaction save karo
        Transaction transaction = Transaction.builder()
                .fromAccount(fromAccount.getAccountNumber())
                .toAccount(toAccount.getAccountNumber())
                .amount(request.getAmount())
                .transactionType(Transaction.TransactionType.TRANSFER)
                .mode(Transaction.TransactionMode
                        .valueOf(request.getMode().toUpperCase()))
                .description(request.getDescription())
                .status(Transaction.TransactionStatus.SUCCESS)
                .referenceNumber(referenceNumber)
                .build();

        transactionRepository.save(transaction);

        // Sender ko notification
        notificationRepository.save(Notification.builder()
                .user(fromAccount.getUser())
                .title("Amount Debited! 💸")
                .message("₹" + request.getAmount() +
                        " debited from " + fromAccount.getAccountNumber() +
                        " to " + toAccount.getAccountNumber() +
                        " | Ref: " + referenceNumber)
                .type(Notification.NotificationType.ALERT)
                .build());

        // Receiver ko notification
        notificationRepository.save(Notification.builder()
                .user(toAccount.getUser())
                .title("Amount Credited! 💰")
                .message("₹" + request.getAmount() +
                        " credited to your account " +
                        toAccount.getAccountNumber() +
                        " | Ref: " + referenceNumber)
                .type(Notification.NotificationType.SUCCESS)
                .build());

        return mapToResponse(transaction);
    }

    // =====================
    // DEPOSIT (Admin)
    // =====================
    @Transactional
    public TransactionResponse deposit(String accountNumber,
                                       BigDecimal amount) {
        Account account = accountRepository
                .findByAccountNumber(accountNumber)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Account not found!"));

        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        String referenceNumber = "DEP" +
                UUID.randomUUID().toString()
                        .replace("-", "")
                        .substring(0, 12)
                        .toUpperCase();

        Transaction transaction = Transaction.builder()
                .toAccount(accountNumber)
                .amount(amount)
                .transactionType(Transaction.TransactionType.DEPOSIT)
                .mode(Transaction.TransactionMode.CASH)
                .description("Cash Deposit")
                .status(Transaction.TransactionStatus.SUCCESS)
                .referenceNumber(referenceNumber)
                .build();

        transactionRepository.save(transaction);

        // Notification
        notificationRepository.save(Notification.builder()
                .user(account.getUser())
                .title("Amount Deposited! 💰")
                .message("₹" + amount +
                        " deposited to your account " + accountNumber)
                .type(Notification.NotificationType.SUCCESS)
                .build());

        return mapToResponse(transaction);
    }

    // =====================
    // TRANSACTION HISTORY
    // =====================
    public List<TransactionResponse> getMyTransactions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found!"));

        // User ke saare accounts ke transactions
        List<Account> accounts = accountRepository.findByUser(user);

        return accounts.stream()
                .flatMap(account ->
                        transactionRepository
                                .findByAccountNumber(account.getAccountNumber())
                                .stream())
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Admin: saari transactions
    public List<TransactionResponse> getAllTransactions() {
        return transactionRepository
                .findAllByOrderByTransactionDateDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // =====================
    // Helper
    // =====================
    private TransactionResponse mapToResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .fromAccount(t.getFromAccount())
                .toAccount(t.getToAccount())
                .amount(t.getAmount())
                .transactionType(t.getTransactionType().name())
                .mode(t.getMode().name())
                .description(t.getDescription())
                .status(t.getStatus().name())
                .referenceNumber(t.getReferenceNumber())
                .transactionDate(t.getTransactionDate())
                .success(true)
                .build();
    }
}