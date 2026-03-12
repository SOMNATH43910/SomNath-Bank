package com.somnathbank.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "checkbook_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckbookRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ✅ FIX: @JsonIgnore — User object serialize nahi hoga, infinite loop band
    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String accountNumber;
    private String requestNumber;
    private Integer numberOfLeaves;
    private String deliveryAddress;

    @Enumerated(EnumType.STRING)
    private CheckbookStatus status;

    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;

    public enum CheckbookStatus {
        PENDING, APPROVED, DISPATCHED, DELIVERED, REJECTED
    }

    @PrePersist
    public void prePersist() {
        requestedAt = LocalDateTime.now();
        if (status == null) status = CheckbookStatus.PENDING;
        if (requestNumber == null) {
            requestNumber = "CHK" + System.currentTimeMillis() % 1000000;
        }
    }
}