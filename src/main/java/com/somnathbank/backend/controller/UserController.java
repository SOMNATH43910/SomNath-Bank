package com.somnathbank.backend.controller;

import com.somnathbank.backend.model.User;
import com.somnathbank.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // GET /api/users/profile
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(user);
    }

    // PUT /api/users/profile/update
    @PutMapping("/profile/update")
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.get("fullName") != null) user.setFullName(request.get("fullName"));
        if (request.get("phone")    != null) user.setPhone(request.get("phone"));
        if (request.get("address")  != null) user.setAddress(request.get("address"));
        if (request.get("city")     != null) user.setCity(request.get("city"));
        if (request.get("state")    != null) user.setState(request.get("state"));
        if (request.get("pincode")  != null) user.setPincode(request.get("pincode"));

        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully!"));
    }

    // PUT /api/users/change-password
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String currentPassword = request.get("currentPassword");
        String newPassword     = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Current password is incorrect!"));
        }
        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "New passwords do not match!"));
        }
        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Password must be at least 6 characters!"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully!"));
    }

    // ✅ PUT /api/users/admin/kyc/approve/{id}
    @PutMapping("/admin/kyc/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveKyc(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setKycStatus(User.KycStatus.VERIFIED);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "KYC approved!"));
    }

    // ✅ PUT /api/users/admin/kyc/reject/{id}
    @PutMapping("/admin/kyc/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectKyc(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setKycStatus(User.KycStatus.REJECTED);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "KYC rejected!"));
    }
}