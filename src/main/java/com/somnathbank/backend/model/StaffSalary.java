package com.somnathbank.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "staff_salaries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffSalary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    private Double amount;         // Kitna pay kiya
    private Integer month;         // 1-12
    private Integer year;          // e.g. 2025
    private String remarks;        // Optional note

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SalaryStatus status = SalaryStatus.PAID;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentType paymentType = PaymentType.SALARY;

    private LocalDateTime paidAt;

    public enum SalaryStatus {
        PAID, PENDING
    }

    public enum PaymentType {
        SALARY,   // Regular monthly salary — ek baar
        BONUS,    // Bonus — kabhi bhi
        ADVANCE   // Advance — kabhi bhi
    }

    @PrePersist
    public void prePersist() {
        paidAt = LocalDateTime.now();
        if (month == null) month = LocalDate.now().getMonthValue();
        if (year  == null) year  = LocalDate.now().getYear();
    }
}