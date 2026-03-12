package com.somnathbank.backend.service;

import com.somnathbank.backend.dto.request.CardRequest;
import com.somnathbank.backend.dto.response.CardResponse;
import com.somnathbank.backend.exception.ResourceNotFoundException;
import com.somnathbank.backend.model.*;
import com.somnathbank.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    // Customer: card apply karo
    public CardResponse applyCard(CardRequest request, String email) {
        User user = getUserByEmail(email);

        Account account = accountRepository
                .findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Account not found!"));

        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new RuntimeException("Account is not active!");
        }

        String cardNumber = generateCardNumber();
        LocalDate expiryDate = LocalDate.now().plusYears(5);
        String cvv = String.format("%03d", new Random().nextInt(999));

        BigDecimal creditLimit = request.getCardType().equalsIgnoreCase("CREDIT")
                ? BigDecimal.valueOf(100000) : BigDecimal.ZERO;

        Card card = Card.builder()
                .user(user)
                .account(account)
                .cardNumber(cardNumber)
                .cardType(Card.CardType.valueOf(request.getCardType().toUpperCase()))
                .cardNetwork(Card.CardNetwork.valueOf(request.getCardNetwork().toUpperCase()))
                .expiryDate(expiryDate)
                .cvv(cvv)
                .creditLimit(creditLimit)
                .cardStatus(Card.CardStatus.PENDING)
                .build();

        cardRepository.save(card);

        notificationRepository.save(Notification.builder()
                .user(user)
                .title("Card Application Submitted!")
                .message("Your " + request.getCardType() + " card application has been submitted. Waiting for approval.")
                .type(Notification.NotificationType.INFO)
                .build());

        return mapToResponse(card);
    }

    // Customer: apne cards dekho
    public List<CardResponse> getMyCards(String email) {
        User user = getUserByEmail(email);
        return cardRepository.findByUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Admin: saare cards dekho
    public List<CardResponse> getAllCards() {
        return cardRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Admin: card approve karo
    public CardResponse approveCard(Long cardId) {
        Card card = getCardById(cardId);
        card.setCardStatus(Card.CardStatus.ACTIVE);
        cardRepository.save(card);

        notificationRepository.save(Notification.builder()
                .user(card.getUser())
                .title("Card Approved! 💳")
                .message("Your " + card.getCardType() + " card has been approved! Card: " + maskCardNumber(card.getCardNumber()))
                .type(Notification.NotificationType.SUCCESS)
                .build());

        return mapToResponse(card);
    }

    // Admin: card block karo
    public CardResponse blockCard(Long cardId) {
        Card card = getCardById(cardId);
        card.setCardStatus(Card.CardStatus.BLOCKED);
        cardRepository.save(card);

        notificationRepository.save(Notification.builder()
                .user(card.getUser())
                .title("Card Blocked ⚠️")
                .message("Your card " + maskCardNumber(card.getCardNumber()) + " has been blocked.")
                .type(Notification.NotificationType.ALERT)
                .build());

        return mapToResponse(card);
    }

    // ✅ Admin: card unblock karo
    public CardResponse unblockCard(Long cardId) {
        Card card = getCardById(cardId);

        if (card.getCardStatus() != Card.CardStatus.BLOCKED) {
            throw new RuntimeException("Card is not blocked!");
        }

        card.setCardStatus(Card.CardStatus.ACTIVE);
        cardRepository.save(card);

        notificationRepository.save(Notification.builder()
                .user(card.getUser())
                .title("Card Unblocked ✅")
                .message("Your card " + maskCardNumber(card.getCardNumber()) + " has been unblocked and is now active.")
                .type(Notification.NotificationType.SUCCESS)
                .build());

        return mapToResponse(card);
    }

    // =====================
    // Helper Methods
    // =====================

    private String generateCardNumber() {
        String cardNumber;
        do {
            StringBuilder sb = new StringBuilder();
            Random random = new Random();
            for (int i = 0; i < 16; i++) sb.append(random.nextInt(10));
            cardNumber = sb.toString();
        } while (cardRepository.existsByCardNumber(cardNumber));
        return cardNumber;
    }

    private String maskCardNumber(String cardNumber) {
        return "**** **** **** " + cardNumber.substring(cardNumber.length() - 4);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found!"));
    }

    private Card getCardById(Long id) {
        return cardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found!"));
    }

    private CardResponse mapToResponse(Card card) {
        return CardResponse.builder()
                .id(card.getId())
                .customerName(card.getUser().getFullName())
                .customerEmail(card.getUser().getEmail())
                .accountNumber(card.getAccount().getAccountNumber())
                .cardNumber(maskCardNumber(card.getCardNumber()))
                .cardType(card.getCardType().name())
                .cardNetwork(card.getCardNetwork().name())
                .expiryDate(card.getExpiryDate())
                .creditLimit(card.getCreditLimit())
                .cardStatus(card.getCardStatus().name())
                .build();
    }
}