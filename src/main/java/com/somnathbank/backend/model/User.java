package com.somnathbank.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(unique = true, nullable = false)
    private String phone;

    @Column(nullable = false)
    private String password;

    private LocalDate dob;
    private String gender;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String city;
    private String state;
    private String pincode;

    @Column(unique = true)
    private String aadharNumber;

    @Column(unique = true)
    private String panNumber;

    // profile photo ka path store hoga (actual file nahi)
    private String profilePhoto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.CUSTOMER;

    // jab tak admin approve nahi karta tab tak false rahega
    @Builder.Default
    private Boolean isActive = false;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private KycStatus kycStatus = KycStatus.PENDING;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum Role {
        CUSTOMER, ADMIN
    }

    public enum KycStatus {
        PENDING, VERIFIED, REJECTED
    }
}