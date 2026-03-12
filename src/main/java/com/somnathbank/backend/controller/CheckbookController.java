package com.somnathbank.backend.controller;

import com.somnathbank.backend.model.CheckbookRequest;
import com.somnathbank.backend.model.Notification;
import com.somnathbank.backend.model.User;
import com.somnathbank.backend.repository.CheckbookRequestRepository;
import com.somnathbank.backend.repository.NotificationRepository;
import com.somnathbank.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/checkbook")
@RequiredArgsConstructor
public class CheckbookController {

    private final CheckbookRequestRepository checkbookRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    // ✅ Customer: Checkbook apply karo
    @PostMapping("/apply")
    public ResponseEntity<CheckbookRequest> applyCheckbook(
            Authentication authentication,
            @RequestBody CheckbookRequest request) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        request.setUser(user);
        request.setStatus(CheckbookRequest.CheckbookStatus.PENDING);
        request.setRequestedAt(LocalDateTime.now());
        request.setRequestNumber("CHK" + System.currentTimeMillis()
                + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        return ResponseEntity.ok(checkbookRepository.save(request));
    }

    // ✅ Customer: Apne requests dekho
    @GetMapping("/my")
    public ResponseEntity<List<CheckbookRequest>> myRequests(
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(
                checkbookRepository.findByUserOrderByRequestedAtDesc(user));
    }

    // ✅ Admin: Saare requests dekho
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CheckbookRequest>> allRequests() {
        return ResponseEntity.ok(
                checkbookRepository.findAllByOrderByRequestedAtDesc());
    }

    // ✅ Admin: Approve karo
    @PutMapping("/admin/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CheckbookRequest> approve(@PathVariable Long id) {
        return checkbookRepository.findById(id).map(req -> {
            req.setStatus(CheckbookRequest.CheckbookStatus.APPROVED);
            req.setProcessedAt(LocalDateTime.now());
            notificationRepository.save(Notification.builder()
                    .user(req.getUser())
                    .title("Checkbook Approved! ✅")
                    .message("Your checkbook request " + req.getRequestNumber() + " has been approved.")
                    .type(Notification.NotificationType.SUCCESS)
                    .build());
            return ResponseEntity.ok(checkbookRepository.save(req));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ✅ Admin: Dispatch karo
    @PutMapping("/admin/dispatch/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CheckbookRequest> dispatch(@PathVariable Long id) {
        return checkbookRepository.findById(id).map(req -> {
            req.setStatus(CheckbookRequest.CheckbookStatus.DISPATCHED);
            req.setProcessedAt(LocalDateTime.now());
            notificationRepository.save(Notification.builder()
                    .user(req.getUser())
                    .title("Checkbook Dispatched! 📦")
                    .message("Your checkbook " + req.getRequestNumber() + " has been dispatched to your address.")
                    .type(Notification.NotificationType.INFO)
                    .build());
            return ResponseEntity.ok(checkbookRepository.save(req));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ✅ Admin: Delivered karo
    @PutMapping("/admin/deliver/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CheckbookRequest> deliver(@PathVariable Long id) {
        return checkbookRepository.findById(id).map(req -> {
            req.setStatus(CheckbookRequest.CheckbookStatus.DELIVERED);
            req.setProcessedAt(LocalDateTime.now());
            notificationRepository.save(Notification.builder()
                    .user(req.getUser())
                    .title("Checkbook Delivered! 🎉")
                    .message("Your checkbook " + req.getRequestNumber() + " has been delivered successfully.")
                    .type(Notification.NotificationType.SUCCESS)
                    .build());
            return ResponseEntity.ok(checkbookRepository.save(req));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ✅ Admin: Reject karo
    @PutMapping("/admin/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CheckbookRequest> reject(@PathVariable Long id) {
        return checkbookRepository.findById(id).map(req -> {
            req.setStatus(CheckbookRequest.CheckbookStatus.REJECTED);
            req.setProcessedAt(LocalDateTime.now());
            notificationRepository.save(Notification.builder()
                    .user(req.getUser())
                    .title("Checkbook Request Rejected ❌")
                    .message("Your checkbook request " + req.getRequestNumber() + " has been rejected.")
                    .type(Notification.NotificationType.ALERT)
                    .build());
            return ResponseEntity.ok(checkbookRepository.save(req));
        }).orElse(ResponseEntity.notFound().build());
    }
}