package com.somnathbank.backend.repository;

import com.somnathbank.backend.model.KycDocument;
import com.somnathbank.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KycDocumentRepository extends JpaRepository<KycDocument, Long> {

    // Ek user ka KYC document
    Optional<KycDocument> findByUser(User user);

    // Saare KYC documents
    List<KycDocument> findAllByOrderByRequestedAtDesc();

    // Status ke hisaab se filter
    List<KycDocument> findByStatus(KycDocument.KycDocStatus status);
}