package com.somnathbank.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "kyc_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KycDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User ke saath relation — JSON mein nahi aayega (infinite loop rokne ke liye)
    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "user_id", unique = true)
    private User user;

    // Base64 images store hongi DB mein
    @Column(columnDefinition = "LONGTEXT")
    private String aadharCard;

    @Column(columnDefinition = "LONGTEXT")
    private String panCard;

    @Column(columnDefinition = "LONGTEXT")
    private String photo;

    @Column(columnDefinition = "LONGTEXT")
    private String signature;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private KycDocStatus status = KycDocStatus.PENDING_UPLOAD;

    // Admin ka comment (reject ya resubmit ke time)
    private String adminRemarks;

    private LocalDateTime requestedAt;   // Admin ne request kiya
    private LocalDateTime submittedAt;   // Customer ne upload kiya
    private LocalDateTime reviewedAt;    // Admin ne review kiya

    public enum KycDocStatus {
        PENDING_UPLOAD,  // Admin ne request kiya, customer ne abhi upload nahi kiya
        SUBMITTED,       // Customer ne sab documents upload kar diye
        APPROVED,        // Admin ne approve kar diya
        REJECTED,        // Admin ne reject kar diya
        RE_SUBMIT        // Admin ne dubara submit karne kaha
    }
}