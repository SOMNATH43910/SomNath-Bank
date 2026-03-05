package com.somnathbank.backend.controller;

import com.somnathbank.backend.dto.request.TransferRequest;
import com.somnathbank.backend.dto.response.TransactionResponse;
import com.somnathbank.backend.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    // Customer: fund transfer karo
    // POST /api/transactions/transfer
    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponse> transfer(
            @Valid @RequestBody TransferRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(
                transactionService.transfer(request, email));
    }

    // Customer: apni transactions dekho
    // GET /api/transactions/my
    @GetMapping("/my")
    public ResponseEntity<List<TransactionResponse>> getMyTransactions(
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(
                transactionService.getMyTransactions(email));
    }

    // Admin: deposit karo
    // POST /api/transactions/admin/deposit/{accountNumber}?amount=5000
    @PostMapping("/admin/deposit/{accountNumber}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransactionResponse> deposit(
            @PathVariable String accountNumber,
            @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(
                transactionService.deposit(accountNumber, amount));
    }

    // Admin: saari transactions dekho
    // GET /api/transactions/admin/all
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TransactionResponse>> getAllTransactions() {
        return ResponseEntity.ok(
                transactionService.getAllTransactions());
    }
}