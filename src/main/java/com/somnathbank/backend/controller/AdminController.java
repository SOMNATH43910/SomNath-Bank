package com.somnathbank.backend.controller;

import com.somnathbank.backend.dto.request.CreateCustomerRequest;
import com.somnathbank.backend.dto.response.CreateCustomerResponse;
import com.somnathbank.backend.dto.response.DashboardResponse;
import com.somnathbank.backend.model.User;
import com.somnathbank.backend.repository.UserRepository;
import com.somnathbank.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    // ✅ Admin Dashboard
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardResponse> getAdminDashboard() {
        return ResponseEntity.ok(adminService.getAdminDashboard());
    }

    // ✅ Customer Dashboard
    @GetMapping("/dashboard/customer")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<DashboardResponse> getCustomerDashboard(
            Authentication authentication) {
        return ResponseEntity.ok(
                adminService.getCustomerDashboard(authentication.getName()));
    }

    // ✅ All Customers
    @GetMapping("/customers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllCustomers() {
        return ResponseEntity.ok(
                userRepository.findAll().stream()
                        .filter(u -> u.getRole().name().equals("CUSTOMER"))
                        .collect(Collectors.toList())
        );
    }

    // ✅ Branch Visit — Naya Customer Account Banao
    @PostMapping("/create-customer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CreateCustomerResponse> createCustomer(
            @RequestBody CreateCustomerRequest request) {
        return ResponseEntity.ok(adminService.createCustomerByAdmin(request));
    }
}