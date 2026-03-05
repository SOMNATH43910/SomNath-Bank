package com.somnathbank.backend.repository;

import com.somnathbank.backend.model.Loan;
import com.somnathbank.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    // User ke saare loans
    List<Loan> findByUser(User user);

    // Status se dhundho (Admin ke liye)
    List<Loan> findByStatus(Loan.LoanStatus status);

    // User ke pending loans
    List<Loan> findByUserAndStatus(User user, Loan.LoanStatus status);
}