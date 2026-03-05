package com.somnathbank.backend.controller;

import com.somnathbank.backend.dto.request.LoanRequest;
import com.somnathbank.backend.dto.response.LoanResponse;
import com.somnathbank.backend.service.LoanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    // Customer: loan apply karo
    @PostMapping("/apply")
    public ResponseEntity<LoanResponse> applyLoan(
            @Valid @RequestBody LoanRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                loanService.applyLoan(request, authentication.getName()));
    }

    // Customer: apne loans dekho
    @GetMapping("/my")
    public ResponseEntity<List<LoanResponse>> getMyLoans(
            Authentication authentication) {
        return ResponseEntity.ok(
                loanService.getMyLoans(authentication.getName()));
    }

    // Admin: saare loans dekho
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LoanResponse>> getAllLoans() {
        return ResponseEntity.ok(loanService.getAllLoans());
    }

    // Admin: approve karo
    @PutMapping("/admin/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanResponse> approveLoan(
            @PathVariable Long id) {
        return ResponseEntity.ok(loanService.approveLoan(id));
    }

    // Admin: reject karo
    @PutMapping("/admin/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanResponse> rejectLoan(
            @PathVariable Long id) {
        return ResponseEntity.ok(loanService.rejectLoan(id));
    }
}