package com.somnathbank.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Kaun sa customer ko notification
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;   // e.g. "Transaction Alert"

    @Column(columnDefinition = "TEXT")
    private String message; // e.g. "₹5000 credit ho gaya"

    @Enumerated(EnumType.STRING)
    private NotificationType type = NotificationType.INFO;

    // Customer ne padha ki nahi
    private Boolean isRead = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum NotificationType {
        INFO,     // Normal info
        SUCCESS,  // Transaction success
        WARNING,  // Low balance etc
        ALERT     // Security alert
    }
}