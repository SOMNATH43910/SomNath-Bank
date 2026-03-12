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
import java.util.Map; // ✅ Yeh missing tha!

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    // Customer: fund transfer
    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponse> transfer(
            @Valid @RequestBody TransferRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(transactionService.transfer(request, email));
    }

    // Customer: apni transactions
    @GetMapping("/my")
    public ResponseEntity<List<TransactionResponse>> getMyTransactions(
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(transactionService.getMyTransactions(email));
    }

    // ✅ Customer: self deposit (cash lekar aaya)
    @PostMapping("/deposit")
    public ResponseEntity<TransactionResponse> selfDeposit(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        String accountNumber = (String) request.get("accountNumber");
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        return ResponseEntity.ok(transactionService.deposit(accountNumber, amount));
    }

    // Admin: deposit
    @PostMapping("/admin/deposit/{accountNumber}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TransactionResponse> deposit(
            @PathVariable String accountNumber,
            @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(transactionService.deposit(accountNumber, amount));
    }

    // Admin: saari transactions
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TransactionResponse>> getAllTransactions() {
        return ResponseEntity.ok(transactionService.getAllTransactions());
    }
}
