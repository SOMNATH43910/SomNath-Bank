package com.somnathbank.backend.controller;

import com.somnathbank.backend.dto.request.StaffIdCardRequest;
import com.somnathbank.backend.dto.response.StaffIdCardResponse;
import com.somnathbank.backend.service.StaffIdCardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/idcards")
@RequiredArgsConstructor
public class StaffIdCardController {

    private final StaffIdCardService idCardService;

    // ── ADMIN: Generate new ID Card ────────────────────────────────────
    @PostMapping("/admin/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffIdCardResponse> generateIdCard(
            @RequestBody StaffIdCardRequest request) {
        return ResponseEntity.ok(idCardService.generateIdCard(request));
    }

    // ── ADMIN: Get all ID Cards ────────────────────────────────────────
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<StaffIdCardResponse>> getAllIdCards() {
        return ResponseEntity.ok(idCardService.getAllIdCards());
    }

    // ── ADMIN: Get specific ID Card by cardId ──────────────────────────
    @GetMapping("/admin/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffIdCardResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(idCardService.getById(id));
    }

    // ── ADMIN: Get ID Card by staffId ─────────────────────────────────
    @GetMapping("/admin/staff/{staffId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffIdCardResponse> getByStaffId(@PathVariable Long staffId) {
        return ResponseEntity.ok(idCardService.getByStaffId(staffId));
    }

    // ── ADMIN: Block ID Card ───────────────────────────────────────────
    @PutMapping("/admin/block/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffIdCardResponse> blockCard(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = (body != null) ? body.getOrDefault("reason", "Blocked by admin") : "Blocked by admin";
        return ResponseEntity.ok(idCardService.blockCard(id, reason));
    }

    // ── ADMIN: Unblock ID Card ─────────────────────────────────────────
    @PutMapping("/admin/unblock/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffIdCardResponse> unblockCard(@PathVariable Long id) {
        return ResponseEntity.ok(idCardService.unblockCard(id));
    }

    // ── ADMIN: Update Room Access ──────────────────────────────────────
    @PutMapping("/admin/room-access/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StaffIdCardResponse> updateRoomAccess(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String roomAccess = body.getOrDefault("roomAccess", "");
        return ResponseEntity.ok(idCardService.updateRoomAccess(id, roomAccess));
    }

    // ── ADMIN: Revoke ID Card ──────────────────────────────────────────
    @PutMapping("/admin/revoke/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> revokeCard(@PathVariable Long id) {
        idCardService.revokeCard(id);
        return ResponseEntity.ok("ID Card revoked successfully");
    }
}