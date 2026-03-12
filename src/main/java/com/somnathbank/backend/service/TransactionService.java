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

    @Transactional
    public TransactionResponse transfer(TransferRequest request, String email) {

        Account fromAccount = accountRepository
                .findByAccountNumber(request.getFromAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("From account not found!"));

        Account toAccount = accountRepository
                .findByAccountNumber(request.getToAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("To account not found!"));

        if (fromAccount.getStatus() != Account.AccountStatus.ACTIVE)
            throw new RuntimeException("Your account is not active!");

        if (toAccount.getStatus() != Account.AccountStatus.ACTIVE)
            throw new RuntimeException("Recipient account is not active!");

        if (fromAccount.getAccountNumber().equals(toAccount.getAccountNumber()))
            throw new RuntimeException("Cannot transfer to same account!");

        if (fromAccount.getBalance().compareTo(request.getAmount()) < 0)
            throw new RuntimeException("Insufficient balance!");

        fromAccount.setBalance(fromAccount.getBalance().subtract(request.getAmount()));
        toAccount.setBalance(toAccount.getBalance().add(request.getAmount()));
        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        // ✅ FIXED - Timestamp + UUID = kabhi duplicate nahi hoga
        String refBase = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        String debitRef  = "TXN" + System.currentTimeMillis() + refBase + "D";
        String creditRef = "TXN" + System.currentTimeMillis() + refBase + "C";

        // ✅ Mode null safe
        Transaction.TransactionMode txnMode =
                (request.getMode() != null && !request.getMode().isEmpty())
                        ? Transaction.TransactionMode.valueOf(request.getMode().toUpperCase())
                        : Transaction.TransactionMode.IMPS;

        // ✅ Description null safe
        String debitDesc = (request.getDescription() != null && !request.getDescription().isEmpty())
                ? request.getDescription()
                : "Transfer to " + toAccount.getAccountNumber();

        String creditDesc = (request.getDescription() != null && !request.getDescription().isEmpty())
                ? request.getDescription()
                : "Transfer from " + fromAccount.getAccountNumber();

        // ✅ DEBIT - Sender (balanceAfter bhi save ho raha hai)
        Transaction debitTxn = Transaction.builder()
                .fromAccount(fromAccount.getAccountNumber())
                .toAccount(toAccount.getAccountNumber())
                .amount(request.getAmount())
                .transactionType(Transaction.TransactionType.DEBIT)
                .mode(txnMode)
                .description(debitDesc)
                .status(Transaction.TransactionStatus.SUCCESS)
                .referenceNumber(debitRef)
                .balanceAfter(fromAccount.getBalance()) // ✅ Bal fix
                .build();
        transactionRepository.save(debitTxn);

        // ✅ CREDIT - Receiver (balanceAfter bhi save ho raha hai)
        Transaction creditTxn = Transaction.builder()
                .fromAccount(fromAccount.getAccountNumber())
                .toAccount(toAccount.getAccountNumber())
                .amount(request.getAmount())
                .transactionType(Transaction.TransactionType.CREDIT)
                .mode(txnMode)
                .description(creditDesc)
                .status(Transaction.TransactionStatus.SUCCESS)
                .referenceNumber(creditRef)
                .balanceAfter(toAccount.getBalance()) // ✅ Bal fix
                .build();
        transactionRepository.save(creditTxn);

        // Sender notification
        notificationRepository.save(Notification.builder()
                .user(fromAccount.getUser())
                .title("Amount Debited! 💸")
                .message("₹" + request.getAmount() +
                        " debited from " + fromAccount.getAccountNumber() +
                        " to " + toAccount.getAccountNumber() +
                        " | Ref: " + debitRef)
                .type(Notification.NotificationType.ALERT)
                .build());

        // Receiver notification
        notificationRepository.save(Notification.builder()
                .user(toAccount.getUser())
                .title("Amount Credited! 💰")
                .message("₹" + request.getAmount() +
                        " credited to your account " +
                        toAccount.getAccountNumber() +
                        " | Ref: " + creditRef)
                .type(Notification.NotificationType.SUCCESS)
                .build());

        return mapToResponse(debitTxn);
    }

    @Transactional
    public TransactionResponse deposit(String accountNumber, BigDecimal amount) {

        Account account = accountRepository
                .findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found!"));

        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);

        // ✅ FIXED - Timestamp + UUID = kabhi duplicate nahi hoga
        String referenceNumber = "DEP" + System.currentTimeMillis()
                + UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();

        Transaction transaction = Transaction.builder()
                .toAccount(accountNumber)
                .amount(amount)
                .transactionType(Transaction.TransactionType.CREDIT)
                .mode(Transaction.TransactionMode.CASH)
                .description("Cash Deposit at Branch")
                .status(Transaction.TransactionStatus.SUCCESS)
                .referenceNumber(referenceNumber)
                .balanceAfter(account.getBalance()) // ✅ Bal fix
                .build();
        transactionRepository.save(transaction);

        notificationRepository.save(Notification.builder()
                .user(account.getUser())
                .title("Amount Deposited! 💰")
                .message("₹" + amount +
                        " deposited to your account " + accountNumber)
                .type(Notification.NotificationType.SUCCESS)
                .build());

        return mapToResponse(transaction);
    }

    public List<TransactionResponse> getMyTransactions(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found!"));

        List<Account> accounts = accountRepository.findByUser(user);

        return accounts.stream()
                .flatMap(account -> transactionRepository
                        .findByFromAccountOrToAccountOrderByTransactionDateDesc(
                                account.getAccountNumber(),
                                account.getAccountNumber())
                        .stream())
                .distinct()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<TransactionResponse> getAllTransactions() {
        return transactionRepository
                .findAllByOrderByTransactionDateDesc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TransactionResponse mapToResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .fromAccount(t.getFromAccount())
                .toAccount(t.getToAccount())
                .amount(t.getAmount())
                .transactionType(t.getTransactionType().name())
                .mode(t.getMode() != null ? t.getMode().name() : "IMPS")
                .description(t.getDescription())
                .status(t.getStatus() != null ? t.getStatus().name() : "SUCCESS")
                .referenceNumber(t.getReferenceNumber())
                .transactionDate(t.getTransactionDate())
                .balanceAfter(t.getBalanceAfter()) // ✅ Bal fix
                .success(true)
                .build();
    }
}