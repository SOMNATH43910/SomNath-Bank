package com.somnathbank.backend.repository;

import com.somnathbank.backend.model.Branch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BranchRepository extends JpaRepository<Branch, Long> {
}