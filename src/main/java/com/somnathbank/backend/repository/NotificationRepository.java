package com.somnathbank.backend.repository;

import com.somnathbank.backend.model.Notification;
import com.somnathbank.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    // User ki saari notifications (latest pehle)
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    // Sirf unread notifications
    List<Notification> findByUserAndIsReadFalse(User user);

    // Unread count
    Long countByUserAndIsReadFalse(User user);
}