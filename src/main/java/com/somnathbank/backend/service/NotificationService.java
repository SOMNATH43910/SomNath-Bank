package com.somnathbank.backend.service;

import com.somnathbank.backend.dto.response.NotificationResponse;
import com.somnathbank.backend.model.Notification;
import com.somnathbank.backend.model.User;
import com.somnathbank.backend.repository.NotificationRepository;
import com.somnathbank.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // Customer ki notifications
    public List<NotificationResponse> getMyNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        return notificationRepository.findByUserOrderByCreatedAtDesc(user)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Read mark karo
    public NotificationResponse markAsRead(Long id, String email) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found!"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
        return mapToResponse(notification);
    }

    // Saari read karo
    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        List<Notification> notifications =
                notificationRepository.findByUserOrderByCreatedAtDesc(user);
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    // Admin - saari notifications
    public List<NotificationResponse> getAllNotifications() {
        return notificationRepository.findAll()
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private NotificationResponse mapToResponse(Notification n) {
        NotificationResponse response = new NotificationResponse();
        response.setId(n.getId());
        response.setTitle(n.getTitle());
        response.setMessage(n.getMessage());
        response.setType(n.getType().name());
        response.setIsRead(n.getIsRead());
        response.setCreatedAt(n.getCreatedAt());
        return response;
    }
}