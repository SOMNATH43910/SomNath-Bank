package com.somnathbank.backend.controller;

import com.somnathbank.backend.dto.response.AccountResponse;
import com.somnathbank.backend.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    // Customer: apne accounts dekho
    @GetMapping("/my")
    public ResponseEntity<List<AccountResponse>> getMyAccounts(Authentication authentication) {
        return ResponseEntity.ok(accountService.getMyAccounts(authentication.getName()));
    }

    // Customer: account number se dekho
    @GetMapping("/{accountNumber}")
    public ResponseEntity<AccountResponse> getAccount(@PathVariable String accountNumber) {
        return ResponseEntity.ok(accountService.getAccountByNumber(accountNumber));
    }

    // Admin: saare accounts dekho
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AccountResponse>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    // Admin: account approve karo
    @PutMapping("/admin/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccountResponse> approveAccount(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.approveAccount(id));
    }

    // Admin: account reject karo
    @PutMapping("/admin/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccountResponse> rejectAccount(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.rejectAccount(id));
    }

    // Admin: account block karo
    @PutMapping("/admin/block/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccountResponse> blockAccount(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.blockAccount(id));
    }

    // ✅ Admin: account unblock karo
    @PutMapping("/admin/unblock/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AccountResponse> unblockAccount(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.unblockAccount(id));
    }
}