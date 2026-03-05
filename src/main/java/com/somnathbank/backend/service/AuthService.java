package com.somnathbank.backend.service;

import com.somnathbank.backend.dto.request.LoginRequest;
import com.somnathbank.backend.dto.request.RegisterRequest;
import com.somnathbank.backend.dto.response.AuthResponse;
import com.somnathbank.backend.model.Account;
import com.somnathbank.backend.model.Notification;
import com.somnathbank.backend.model.User;
import com.somnathbank.backend.repository.AccountRepository;
import com.somnathbank.backend.repository.NotificationRepository;
import com.somnathbank.backend.repository.UserRepository;
import com.somnathbank.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    // =====================
    // REGISTER
    // =====================
    public AuthResponse register(RegisterRequest request) {

        // Email already exists?
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }

        // Phone already exists?
        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone already registered!");
        }

        // Aadhar already exists?
        if (userRepository.existsByAadharNumber(request.getAadharNumber())) {
            throw new RuntimeException("Aadhar already registered!");
        }

        // PAN already exists?
        if (userRepository.existsByPanNumber(request.getPanNumber())) {
            throw new RuntimeException("PAN already registered!");
        }

        // User banao
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .dob(request.getDob())
                .gender(request.getGender())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .aadharNumber(request.getAadharNumber())
                .panNumber(request.getPanNumber())
                .role(User.Role.CUSTOMER)
                .isActive(false)         // Admin approve karega
                .kycStatus(User.KycStatus.PENDING)
                .build();

        userRepository.save(user);

        // Account banao (PENDING status mein)
        Account.AccountType accountType = Account.AccountType.SAVINGS;
        if (request.getAccountType() != null) {
            accountType = Account.AccountType
                    .valueOf(request.getAccountType().toUpperCase());
        }

        Account account = Account.builder()
                .user(user)
                .accountNumber(generateAccountNumber())
                .accountType(accountType)
                .status(Account.AccountStatus.PENDING)
                .build();

        accountRepository.save(account);

        // Welcome notification bhejo
        Notification notification = Notification.builder()
                .user(user)
                .title("Welcome to SomNath Bank!")
                .message("Dear " + user.getFullName() +
                        ", your account opening request has been submitted. " +
                        "Please wait for admin approval.")
                .type(Notification.NotificationType.INFO)
                .build();

        notificationRepository.save(notification);

        return AuthResponse.builder()
                .success(true)
                .message("Registration successful! Waiting for admin approval.")
                .build();
    }

    // =====================
    // LOGIN
    // =====================
    public AuthResponse login(LoginRequest request) {

        // Email se user dhundho
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password!"));

        // Account active hai?
        if (!user.getIsActive()) {
            throw new RuntimeException(
                    "Account not activated yet! Please wait for admin approval.");
        }

        // Password check karo
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getPassword())
        );

        // JWT token banao
        String token = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .role(user.getRole().name())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .success(true)
                .message("Login successful!")
                .build();
    }

    // =====================
    // Account Number Generator
    // =====================
    private String generateAccountNumber() {
        // 12 digit unique account number
        String accountNumber;
        do {
            accountNumber = "SNB" +
                    String.format("%09d", new Random().nextInt(999999999));
        } while (accountRepository.existsByAccountNumber(accountNumber));
        return accountNumber;
    }
}