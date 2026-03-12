package com.somnathbank.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Complaint details
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ComplaintCategory category = ComplaintCategory.OTHER;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.OPEN;

    // Admin reply
    @Column(columnDefinition = "TEXT")
    private String adminReply;

    private LocalDateTime repliedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ComplaintCategory {
        ACCOUNT,        // Account related
        CARD,           // Card related
        LOAN,           // Loan related
        TRANSACTION,    // Transaction related
        STAFF,          // Staff behaviour
        TECHNICAL,      // App/website issue
        OTHER           // Other
    }

    public enum ComplaintStatus {
        OPEN,           // Naya complaint
        IN_PROGRESS,    // Admin ne dekha, kaam ho raha hai
        RESOLVED,       // Admin ne resolve kar diya
        CLOSED          // Band kar diya
    }
}