package com.somnathbank.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "staff_id_cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffIdCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Link to Staff
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false, unique = true)
    private Staff staff;

    // ID Card unique number e.g. SNB-CARD-00123
    @Column(name = "card_number", unique = true, nullable = false)
    private String cardNumber;

    // Card display fields
    @Column(name = "staff_name", nullable = false)
    private String staffName;

    @Column(name = "designation", nullable = false)
    private String designation;          // shown as ROLE on card

    @Column(name = "department")
    private String department;

    @Column(name = "blood_group")
    private String bloodGroup;           // e.g. A+, B-, O+

    @Column(name = "office_address")
    private String officeAddress;        // Branch address

    @Column(name = "issue_date", nullable = false)
    private LocalDate issueDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;        // usually 3 years from issue

    // Access permissions (admin controlled)
    @Column(name = "room_access")
    private String roomAccess;           // e.g. "SERVER_ROOM,VAULT,MANAGER_CABIN"

    // Status
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CardStatus status;

    @Column(name = "blocked_reason")
    private String blockedReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (issueDate == null) issueDate = LocalDate.now();
        if (expiryDate == null) expiryDate = issueDate.plusYears(3);
        if (status == null) status = CardStatus.ACTIVE;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum CardStatus {
        ACTIVE,
        BLOCKED,
        EXPIRED,
        REVOKED
    }
}