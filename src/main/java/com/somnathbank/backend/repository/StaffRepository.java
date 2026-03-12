package com.somnathbank.backend.repository;

import com.somnathbank.backend.model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    List<Staff> findByBranchName(String branchName);
    List<Staff> findByStatus(Staff.StaffStatus status);
}