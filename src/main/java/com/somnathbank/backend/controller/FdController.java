package com.somnathbank.backend.controller;

import com.somnathbank.backend.dto.request.FdRequest;
import com.somnathbank.backend.dto.response.FdResponse;
import com.somnathbank.backend.service.FdService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/fd")
@RequiredArgsConstructor
public class FdController {

    private final FdService fdService;

    @PostMapping("/open")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<FdResponse> openFd(
            @Valid @RequestBody FdRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(
                fdService.openFd(request, authentication.getName()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<FdResponse>> getMyFds(
            Authentication authentication) {
        return ResponseEntity.ok(
                fdService.getMyFds(authentication.getName()));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FdResponse>> getAllFds() {
        return ResponseEntity.ok(fdService.getAllFds());
    }

    @PutMapping("/break/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<FdResponse> breakFd(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(
                fdService.breakFd(id, authentication.getName()));
    }
}