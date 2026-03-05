package com.somnathbank.backend.repository;

import com.somnathbank.backend.model.Account;
import com.somnathbank.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    // User ke saare accounts
    List<Account> findByUser(User user);

    // Account number se dhundho
    Optional<Account> findByAccountNumber(String accountNumber);

    // Account number exist karta hai?
    Boolean existsByAccountNumber(String accountNumber);

    // User ke active accounts
    List<Account> findByUserAndStatus(User user, Account.AccountStatus status);
}