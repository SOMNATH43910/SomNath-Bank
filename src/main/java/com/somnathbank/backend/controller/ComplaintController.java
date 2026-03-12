package com.somnathbank.backend.controller;

import com.somnathbank.backend.model.*;
import com.somnathbank.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    // ✅ CUSTOMER: Naya complaint submit karo
    @PostMapping("/submit")
    public ResponseEntity<?> submitComplaint(
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (body.get("subject") == null || body.get("description") == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Subject aur description zaroori hai!"));
        }

        Complaint complaint = Complaint.builder()
                .user(user)
                .subject(body.get("subject"))
                .description(body.get("description"))
                .category(body.get("category") != null
                        ? Complaint.ComplaintCategory.valueOf(body.get("category"))
                        : Complaint.ComplaintCategory.OTHER)
                .status(Complaint.ComplaintStatus.OPEN)
                .build();

        complaintRepository.save(complaint);

        userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .forEach(admin ->
                        notificationRepository.save(
                                Notification.builder()
                                        .user(admin)
                                        .title("New Complaint Received 📋")
                                        .message(user.getFullName() + " ne complaint submit ki: " + body.get("subject"))
                                        .type(Notification.NotificationType.WARNING)
                                        .build()
                        )
                );

        return ResponseEntity.ok(Map.of("message", "Complaint submitted successfully!"));
    }

    // ✅ CUSTOMER: Apni saari complaints dekho
    @GetMapping("/my")
    public ResponseEntity<?> myComplaints(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Map<String, Object>> result = complaintRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(c -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id",          c.getId());
                    map.put("subject",     c.getSubject());
                    map.put("description", c.getDescription());
                    map.put("category",    c.getCategory().name());
                    map.put("status",      c.getStatus().name());
                    map.put("adminReply",  c.getAdminReply() != null ? c.getAdminReply() : "");
                    map.put("repliedAt",   c.getRepliedAt()  != null ? c.getRepliedAt().toString() : "");
                    map.put("createdAt",   c.getCreatedAt()  != null ? c.getCreatedAt().toString() : "");
                    return map;
                })
                .toList();

        return ResponseEntity.ok(result);
    }

    // ✅ ADMIN: Saari complaints dekho
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> allComplaints() {

        List<Map<String, Object>> result = complaintRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(c -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id",           c.getId());
                    map.put("customerName", c.getUser().getFullName());
                    map.put("email",        c.getUser().getEmail());
                    map.put("subject",      c.getSubject());
                    map.put("description",  c.getDescription());
                    map.put("category",     c.getCategory().name());
                    map.put("status",       c.getStatus().name());
                    map.put("adminReply",   c.getAdminReply() != null ? c.getAdminReply() : "");
                    map.put("repliedAt",    c.getRepliedAt()  != null ? c.getRepliedAt().toString() : "");
                    map.put("createdAt",    c.getCreatedAt()  != null ? c.getCreatedAt().toString() : "");
                    return map;
                })
                .toList();

        return ResponseEntity.ok(result);
    }

    // ✅ ADMIN: Reply karo aur status update karo — FIXED
    @PutMapping("/admin/reply/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> replyComplaint(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        // ✅ FIX: "reply" → "adminReply" (AdminPanel yahi bhejta hai)
        String reply = body.get("adminReply");

        if (reply == null || reply.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Reply text zaroori hai!"));
        }

        complaint.setAdminReply(reply);
        complaint.setRepliedAt(LocalDateTime.now());

        if (body.get("status") != null) {
            try {
                complaint.setStatus(Complaint.ComplaintStatus.valueOf(body.get("status")));
            } catch (Exception ignored) {}
        }

        complaintRepository.save(complaint);

        // Customer ko notification bhejo
        notificationRepository.save(
                Notification.builder()
                        .user(complaint.getUser())
                        .title("Admin Replied to Your Complaint 💬")
                        .message("Your complaint '" + complaint.getSubject() + "' got a reply!")
                        .type(Notification.NotificationType.SUCCESS)
                        .build()
        );

        return ResponseEntity.ok(Map.of("message", "Reply sent successfully!"));
    }
}