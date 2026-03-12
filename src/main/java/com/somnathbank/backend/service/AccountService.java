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

    public List<AccountResponse> getMyAccounts(String email) {
        User user = getUserByEmail(email);
        return accountRepository.findByUser(user).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    public AccountResponse getAccountByNumber(String accountNumber) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found!"));
        return mapToResponse(account);
    }

    public List<AccountResponse> getAllAccounts() {
        return accountRepository.findAll().stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    public AccountResponse approveAccount(Long accountId) {
        Account account = getAccountById(accountId);
        account.setStatus(Account.AccountStatus.ACTIVE);
        accountRepository.save(account);
        notificationRepository.save(Notification.builder()
                .user(account.getUser())
                .title("Account Approved! 🎉")
                .message("Your account " + account.getAccountNumber() + " has been approved and is now active!")
                .type(Notification.NotificationType.SUCCESS).build());
        return mapToResponse(account);
    }

    public AccountResponse rejectAccount(Long accountId) {
        Account account = getAccountById(accountId);
        account.setStatus(Account.AccountStatus.CLOSED);
        accountRepository.save(account);
        notificationRepository.save(Notification.builder()
                .user(account.getUser())
                .title("Account Rejected ❌")
                .message("Your account request has been rejected. Please contact bank for more info.")
                .type(Notification.NotificationType.WARNING).build());
        return mapToResponse(account);
    }

    public AccountResponse blockAccount(Long accountId) {
        Account account = getAccountById(accountId);
        account.setStatus(Account.AccountStatus.BLOCKED);
        accountRepository.save(account);
        notificationRepository.save(Notification.builder()
                .user(account.getUser())
                .title("Account Blocked ⚠️")
                .message("Your account " + account.getAccountNumber() + " has been blocked. Please contact bank.")
                .type(Notification.NotificationType.ALERT).build());
        return mapToResponse(account);
    }

    // ✅ NEW: Account Unblock
    public AccountResponse unblockAccount(Long accountId) {
        Account account = getAccountById(accountId);
        if (account.getStatus() != Account.AccountStatus.BLOCKED) {
            throw new RuntimeException("Account is not blocked!");
        }
        account.setStatus(Account.AccountStatus.ACTIVE);
        accountRepository.save(account);
        notificationRepository.save(Notification.builder()
                .user(account.getUser())
                .title("Account Unblocked ✅")
                .message("Your account " + account.getAccountNumber() + " has been unblocked and is now active.")
                .type(Notification.NotificationType.SUCCESS).build());
        return mapToResponse(account);
    }

    // =====================
    // Helper Methods
    // =====================
    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found!"));
    }

    private Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found!"));
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