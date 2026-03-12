package com.somnathbank.backend.repository;

import com.somnathbank.backend.model.StaffIdCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffIdCardRepository extends JpaRepository<StaffIdCard, Long> {

    Optional<StaffIdCard> findByStaffId(Long staffId);

    Optional<StaffIdCard> findByCardNumber(String cardNumber);

    boolean existsByStaffId(Long staffId);

    List<StaffIdCard> findByStatus(StaffIdCard.CardStatus status);
}