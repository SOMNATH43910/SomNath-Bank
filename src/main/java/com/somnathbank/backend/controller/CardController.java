package com.somnathbank.backend.controller;

import com.somnathbank.backend.dto.request.CardRequest;
import com.somnathbank.backend.dto.response.CardResponse;
import com.somnathbank.backend.service.CardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    // Customer - Card Apply
    @PostMapping("/apply")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<CardResponse> applyCard(
            @Valid @RequestBody CardRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(cardService.applyCard(request, authentication.getName()));
    }

    // Customer - Apne Cards Dekho
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<CardResponse>> getMyCards(Authentication authentication) {
        return ResponseEntity.ok(cardService.getMyCards(authentication.getName()));
    }

    // Admin - Saare Cards Dekho
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CardResponse>> getAllCards() {
        return ResponseEntity.ok(cardService.getAllCards());
    }

    // Admin - Card Approve
    @PutMapping("/admin/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CardResponse> approveCard(@PathVariable Long id) {
        return ResponseEntity.ok(cardService.approveCard(id));
    }

    // Admin - Card Block
    @PutMapping("/admin/block/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CardResponse> blockCard(@PathVariable Long id) {
        return ResponseEntity.ok(cardService.blockCard(id));
    }

    // ✅ Admin - Card Unblock
    @PutMapping("/admin/unblock/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CardResponse> unblockCard(@PathVariable Long id) {
        return ResponseEntity.ok(cardService.unblockCard(id));
    }
}