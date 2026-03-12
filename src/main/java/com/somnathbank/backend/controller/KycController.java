package com.somnathbank.backend.controller;

import com.somnathbank.backend.model.*;
import com.somnathbank.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
public class KycController {

    private final KycDocumentRepository kycRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    // ✅ ADMIN: Customer ko documents upload karne ki request bhejo
    @PostMapping("/admin/request/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> requestDocuments(@PathVariable Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Pehle se KYC record hai toh update karo, nahi hai toh naya banao
        KycDocument kyc = kycRepository.findByUser(user)
                .orElse(KycDocument.builder().user(user).build());

        kyc.setStatus(KycDocument.KycDocStatus.PENDING_UPLOAD);
        kyc.setRequestedAt(LocalDateTime.now());
        kyc.setAdminRemarks(null);
        kycRepository.save(kyc);

        // Customer ko notification bhejo
        notificationRepository.save(
                Notification.builder()
                        .user(user)
                        .title("KYC Documents Required 📄")
                        .message("Please upload your KYC documents: Aadhar Card, PAN Card, Passport Photo, and Signature.")
                        .type(Notification.NotificationType.WARNING)
                        .build()
        );

        return ResponseEntity.ok(Map.of("message", "Document request sent to customer!"));
    }

    // ✅ CUSTOMER: Documents upload karo
    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocuments(
            @RequestBody Map<String, String> docs,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        KycDocument kyc = kycRepository.findByUser(user)
                .orElse(KycDocument.builder().user(user).build());

        if (docs.get("aadharCard") != null) kyc.setAadharCard(docs.get("aadharCard"));
        if (docs.get("panCard")    != null) kyc.setPanCard(docs.get("panCard"));
        if (docs.get("photo")      != null) kyc.setPhoto(docs.get("photo"));
        if (docs.get("signature")  != null) kyc.setSignature(docs.get("signature"));

        kyc.setStatus(KycDocument.KycDocStatus.SUBMITTED);
        kyc.setSubmittedAt(LocalDateTime.now());
        kycRepository.save(kyc);

        // Saare admins ko notification bhejo
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .forEach(admin ->
                        notificationRepository.save(
                                Notification.builder()
                                        .user(admin)
                                        .title("New KYC Submission 📋")
                                        .message(user.getFullName() + " ne KYC documents submit kar diye. Please review!")
                                        .type(Notification.NotificationType.INFO)
                                        .build()
                        )
                );

        return ResponseEntity.ok(Map.of("message", "Documents uploaded successfully!"));
    }

    // ✅ CUSTOMER: Apna KYC status dekho (documents nahi, sirf status)
    @GetMapping("/my")
    public ResponseEntity<?> getMyKyc(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return kycRepository.findByUser(user)
                .map(kyc -> {
                    Map<String, Object> response = Map.of(
                            "id",           kyc.getId(),
                            "status",       kyc.getStatus().name(),
                            "adminRemarks", kyc.getAdminRemarks() != null ? kyc.getAdminRemarks() : "",
                            "submittedAt",  kyc.getSubmittedAt()  != null ? kyc.getSubmittedAt().toString() : "",
                            "hasAadhar",    kyc.getAadharCard()   != null,
                            "hasPan",       kyc.getPanCard()      != null,
                            "hasPhoto",     kyc.getPhoto()        != null,
                            "hasSignature", kyc.getSignature()    != null
                    );
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.ok(Map.of("status", "NOT_REQUESTED")));
    }

    // ✅ ADMIN: Saare KYC records dekho
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllKyc() {

        List<Map<String, Object>> result = kycRepository
                .findAllByOrderByRequestedAtDesc()
                .stream()
                .map(kyc -> {
                    User u = kyc.getUser();
                    // Map.of() max 10 entries allow karta hai — isliye HashMap use karo
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("id",           kyc.getId());
                    map.put("userId",       u.getId());
                    map.put("customerName", u.getFullName());
                    map.put("email",        u.getEmail());
                    map.put("phone",        u.getPhone() != null ? u.getPhone() : "");
                    map.put("kycStatus",    u.getKycStatus().name());
                    map.put("status",       kyc.getStatus().name());
                    map.put("adminRemarks", kyc.getAdminRemarks() != null ? kyc.getAdminRemarks() : "");
                    map.put("submittedAt",  kyc.getSubmittedAt()  != null ? kyc.getSubmittedAt().toString() : "");
                    map.put("requestedAt",  kyc.getRequestedAt()  != null ? kyc.getRequestedAt().toString() : "");
                    map.put("hasAadhar",    kyc.getAadharCard()   != null);
                    map.put("hasPan",       kyc.getPanCard()      != null);
                    map.put("hasPhoto",     kyc.getPhoto()        != null);
                    map.put("hasSignature", kyc.getSignature()    != null);
                    return map;
                })
                .toList();

        return ResponseEntity.ok(result);
    }

    // ✅ ADMIN: Documents ke saath full data dekho (review ke liye)
    @GetMapping("/admin/view/{kycId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> viewKycDocuments(@PathVariable Long kycId) {

        KycDocument kyc = kycRepository.findById(kycId)
                .orElseThrow(() -> new RuntimeException("KYC not found"));

        User u = kyc.getUser();

        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id",           kyc.getId());
        map.put("userId",       u.getId());
        map.put("customerName", u.getFullName());
        map.put("email",        u.getEmail());
        map.put("status",       kyc.getStatus().name());
        map.put("adminRemarks", kyc.getAdminRemarks() != null ? kyc.getAdminRemarks() : "");
        map.put("aadharCard",   kyc.getAadharCard()   != null ? kyc.getAadharCard()   : "");
        map.put("panCard",      kyc.getPanCard()       != null ? kyc.getPanCard()       : "");
        map.put("photo",        kyc.getPhoto()         != null ? kyc.getPhoto()         : "");
        map.put("signature",    kyc.getSignature()     != null ? kyc.getSignature()     : "");

        return ResponseEntity.ok(map);
    }

    // ✅ ADMIN: KYC Approve karo
    @PutMapping("/admin/approve/{kycId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveKyc(@PathVariable Long kycId) {

        KycDocument kyc = kycRepository.findById(kycId)
                .orElseThrow(() -> new RuntimeException("KYC not found"));

        kyc.setStatus(KycDocument.KycDocStatus.APPROVED);
        kyc.setReviewedAt(LocalDateTime.now());
        kycRepository.save(kyc);

        // User ka kycStatus bhi VERIFIED karo
        User user = kyc.getUser();
        user.setKycStatus(User.KycStatus.VERIFIED);
        userRepository.save(user);

        notificationRepository.save(
                Notification.builder()
                        .user(user)
                        .title("KYC Approved! ✅")
                        .message("Your KYC documents have been verified. Your account is now fully activated!")
                        .type(Notification.NotificationType.SUCCESS)
                        .build()
        );

        return ResponseEntity.ok(Map.of("message", "KYC approved!"));
    }

    // ✅ ADMIN: KYC Reject karo
    @PutMapping("/admin/reject/{kycId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectKyc(
            @PathVariable Long kycId,
            @RequestBody(required = false) Map<String, String> body) {

        KycDocument kyc = kycRepository.findById(kycId)
                .orElseThrow(() -> new RuntimeException("KYC not found"));

        kyc.setStatus(KycDocument.KycDocStatus.REJECTED);
        kyc.setReviewedAt(LocalDateTime.now());
        if (body != null && body.get("remarks") != null) {
            kyc.setAdminRemarks(body.get("remarks"));
        }
        kycRepository.save(kyc);

        User user = kyc.getUser();
        user.setKycStatus(User.KycStatus.REJECTED);
        userRepository.save(user);

        notificationRepository.save(
                Notification.builder()
                        .user(user)
                        .title("KYC Rejected ❌")
                        .message("Your KYC was rejected. Reason: " +
                                (kyc.getAdminRemarks() != null ? kyc.getAdminRemarks() : "Documents invalid or unclear."))
                        .type(Notification.NotificationType.WARNING)
                        .build()
        );

        return ResponseEntity.ok(Map.of("message", "KYC rejected!"));
    }

    // ✅ ADMIN: Re-submit request karo
    @PutMapping("/admin/resubmit/{kycId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> requestResubmit(
            @PathVariable Long kycId,
            @RequestBody(required = false) Map<String, String> body) {

        KycDocument kyc = kycRepository.findById(kycId)
                .orElseThrow(() -> new RuntimeException("KYC not found"));

        kyc.setStatus(KycDocument.KycDocStatus.RE_SUBMIT);
        kyc.setReviewedAt(LocalDateTime.now());
        if (body != null && body.get("remarks") != null) {
            kyc.setAdminRemarks(body.get("remarks"));
        }
        kycRepository.save(kyc);

        notificationRepository.save(
                Notification.builder()
                        .user(kyc.getUser())
                        .title("KYC Re-submission Required 🔄")
                        .message("Please re-upload your KYC documents. Reason: " +
                                (kyc.getAdminRemarks() != null ? kyc.getAdminRemarks() : "Documents unclear."))
                        .type(Notification.NotificationType.WARNING)
                        .build()
        );

        return ResponseEntity.ok(Map.of("message", "Re-submission requested!"));
    }
}