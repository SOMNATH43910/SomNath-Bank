package com.somnathbank.backend.service;

import com.somnathbank.backend.dto.response.AccountResponse;
import com.somnathbank.backend.exception.ResourceNotFoundException;
import com.somnathbank.backend.model.Account;
import com.somnathbank.backend.model.Notification;
import com.somnathbank.backend.model.User;
import com.somnathbank.backend.repository.AccountRepository;
import com.somnathbank.backend.repository.NotificationRepository;
import com.somnathbank.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    // Customer ka apna account dekho
    public List<AccountResponse> getMyAccounts(String email) {
        User user = getUserByEmail(email);
        List<Account> accounts = accountRepository.findByUser(user);
        return accounts.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Account number se details dekho
    public AccountResponse getAccountByNumber(String accountNumber) {
        Account account = accountRepository
                .findByAccountNumber(accountNumber)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Account not found!"));
        return mapToResponse(account);
    }

    // Admin: saare accounts dekho
    public List<AccountResponse> getAllAccounts() {
        return accountRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Admin: account approve karo
    public AccountResponse approveAccount(Long accountId) {
        Account account = getAccountById(accountId);
        account.setStatus(Account.AccountStatus.ACTIVE);
        accountRepository.save(account);

        // Customer ko notification bhejo
        Notification notification = Notification.builder()
                .user(account.getUser())
                .title("Account Approved! 🎉")
                .message("Your account " + account.getAccountNumber() +
                        " has been approved and is now active!")
                .type(Notification.NotificationType.SUCCESS)
                .build();
        notificationRepository.save(notification);

        return mapToResponse(account);
    }

    // Admin: account reject karo
    public AccountResponse rejectAccount(Long accountId) {
        Account account = getAccountById(accountId);
        account.setStatus(Account.AccountStatus.CLOSED);
        accountRepository.save(account);

        // Customer ko notification bhejo
        Notification notification = Notification.builder()
                .user(account.getUser())
                .title("Account Rejected ❌")
                .message("Your account request has been rejected. " +
                        "Please contact bank for more info.")
                .type(Notification.NotificationType.WARNING)
                .build();
        notificationRepository.save(notification);

        return mapToResponse(account);
    }

    // Admin: account block karo
    public AccountResponse blockAccount(Long accountId) {
        Account account = getAccountById(accountId);
        account.setStatus(Account.AccountStatus.BLOCKED);
        accountRepository.save(account);

        Notification notification = Notification.builder()
                .user(account.getUser())
                .title("Account Blocked ⚠️")
                .message("Your account " + account.getAccountNumber() +
                        " has been blocked. Please contact bank.")
                .type(Notification.NotificationType.ALERT)
                .build();
        notificationRepository.save(notification);

        return mapToResponse(account);
    }

    // =====================
    // Helper Methods
    // =====================
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found!"));
    }

    private Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Account not found!"));
    }

    private AccountResponse mapToResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .accountType(account.getAccountType().name())
                .balance(account.getBalance())
                .ifscCode(account.getIfscCode())
                .branchName(account.getBranchName())
                .status(account.getStatus().name())
                .ownerName(account.getUser().getFullName())
                .build();
    }
}