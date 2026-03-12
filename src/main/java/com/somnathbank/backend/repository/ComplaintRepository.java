package com.somnathbank.backend.repository;

import com.somnathbank.backend.model.Complaint;
import com.somnathbank.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

    // Customer ke saare complaints — latest pehle
    List<Complaint> findByUserOrderByCreatedAtDesc(User user);

    // Saare complaints — latest pehle (Admin ke liye)
    List<Complaint> findAllByOrderByCreatedAtDesc();

    // Status ke hisaab se filter (Admin ke liye)
    List<Complaint> findByStatusOrderByCreatedAtDesc(Complaint.ComplaintStatus status);
}