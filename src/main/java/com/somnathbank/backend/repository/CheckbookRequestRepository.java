package com.somnathbank.backend.repository;

import com.somnathbank.backend.model.CheckbookRequest;
import com.somnathbank.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CheckbookRequestRepository extends JpaRepository<CheckbookRequest, Long> {
    List<CheckbookRequest> findByUserOrderByRequestedAtDesc(User user);
    List<CheckbookRequest> findAllByOrderByRequestedAtDesc();
}