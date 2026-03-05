package com.somnathbank.backend.repository;

import com.somnathbank.backend.model.Card;
import com.somnathbank.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    // User ke saare cards
    List<Card> findByUser(User user);

    // Card number se dhundho
    Optional<Card> findByCardNumber(String cardNumber);

    // Card number exist karta hai?
    Boolean existsByCardNumber(String cardNumber);

    // Status se dhundho
    List<Card> findByCardStatus(Card.CardStatus status);
}