package com.somnathbank.backend.repository;

import com.somnathbank.backend.model.FixedDeposit;
import com.somnathbank.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FixedDepositRepository extends JpaRepository<FixedDeposit, Long> {
    // User ke saare FDs
    List<FixedDeposit> findByUser(User user);

    // FD number se dhundho
    Optional<FixedDeposit> findByFdNumber(String fdNumber);

    // Active FDs
    List<FixedDeposit> findByUserAndStatus(User user, FixedDeposit.FdStatus status);
}