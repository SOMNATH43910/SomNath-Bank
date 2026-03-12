package com.somnathbank.backend.controller;

import com.somnathbank.backend.dto.response.NotificationResponse;
import com.somnathbank.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // Customer - Apni Notifications Dekho
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<NotificationResponse>> getMyNotifications(
            Authentication authentication) {
        return ResponseEntity.ok(
                notificationService.getMyNotifications(
                        authentication.getName()));
    }

    // Customer - Notification Read Mark Karo
    @PutMapping("/read/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(
                notificationService.markAsRead(id,
                        authentication.getName()));
    }

    // Customer - Saari Notifications Read Mark Karo
    @PutMapping("/read-all")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<String> markAllAsRead(
            Authentication authentication) {
        notificationService.markAllAsRead(authentication.getName());
        return ResponseEntity.ok("All notifications marked as read!");
    }

    // Admin - Saari Notifications Dekho
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<NotificationResponse>> getAllNotifications() {
        return ResponseEntity.ok(
                notificationService.getAllNotifications());
    }
}