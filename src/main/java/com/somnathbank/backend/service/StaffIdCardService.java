package com.somnathbank.backend.service;

import com.somnathbank.backend.dto.request.StaffIdCardRequest;
import com.somnathbank.backend.dto.response.StaffIdCardResponse;
import com.somnathbank.backend.exception.ResourceNotFoundException;
import com.somnathbank.backend.model.Staff;
import com.somnathbank.backend.model.StaffIdCard;
import com.somnathbank.backend.repository.StaffIdCardRepository;
import com.somnathbank.backend.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // ✅ ADD THIS IMPORT

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffIdCardService {

    private final StaffIdCardRepository idCardRepository;
    private final StaffRepository staffRepository;

    // ── Generate ID Card (Admin only) ─────────────────────────────────
    @Transactional // ✅ FIXED
    public StaffIdCardResponse generateIdCard(StaffIdCardRequest request) {
        Staff staff = staffRepository.findById(request.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + request.getStaffId()));

        if (idCardRepository.existsByStaffId(staff.getId())) {
            throw new RuntimeException("ID Card already exists for this staff member. Use update instead.");
        }

        String cardNumber = generateCardNumber(staff.getId());

        StaffIdCard card = StaffIdCard.builder()
                .staff(staff)
                .cardNumber(cardNumber)
                .staffName(staff.getFullName())
                .designation(staff.getDesignation())
                .department(staff.getDepartment())
                .bloodGroup(request.getBloodGroup())
                .officeAddress(request.getOfficeAddress() != null
                        ? request.getOfficeAddress()
                        : staff.getBranchName())
                .roomAccess(request.getRoomAccess())
                .issueDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusYears(3))
                .status(StaffIdCard.CardStatus.ACTIVE)
                .build();

        StaffIdCard saved = idCardRepository.save(card);
        return toResponse(saved);
    }

    // ── Get All ID Cards ───────────────────────────────────────────────
    @Transactional(readOnly = true) // ✅ FIXED — yahi bug tha!
    public List<StaffIdCardResponse> getAllIdCards() {
        return idCardRepository.findAll()
                .stream().map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Get ID Card by Staff ID ────────────────────────────────────────
    @Transactional(readOnly = true) // ✅ FIXED
    public StaffIdCardResponse getByStaffId(Long staffId) {
        StaffIdCard card = idCardRepository.findByStaffId(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("ID Card not found for staff id: " + staffId));
        return toResponse(card);
    }

    // ── Get ID Card by Card ID ─────────────────────────────────────────
    @Transactional(readOnly = true) // ✅ FIXED
    public StaffIdCardResponse getById(Long id) {
        StaffIdCard card = idCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ID Card not found: " + id));
        return toResponse(card);
    }

    // ── Block ID Card (Admin only) ─────────────────────────────────────
    @Transactional // ✅ FIXED
    public StaffIdCardResponse blockCard(Long id, String reason) {
        StaffIdCard card = idCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ID Card not found: " + id));
        card.setStatus(StaffIdCard.CardStatus.BLOCKED);
        card.setBlockedReason(reason);
        return toResponse(idCardRepository.save(card));
    }

    // ── Unblock ID Card (Admin only) ───────────────────────────────────
    @Transactional // ✅ FIXED
    public StaffIdCardResponse unblockCard(Long id) {
        StaffIdCard card = idCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ID Card not found: " + id));
        card.setStatus(StaffIdCard.CardStatus.ACTIVE);
        card.setBlockedReason(null);
        return toResponse(idCardRepository.save(card));
    }

    // ── Update Room Access (Admin only) ───────────────────────────────
    @Transactional // ✅ FIXED
    public StaffIdCardResponse updateRoomAccess(Long id, String roomAccess) {
        StaffIdCard card = idCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ID Card not found: " + id));
        card.setRoomAccess(roomAccess);
        return toResponse(idCardRepository.save(card));
    }

    // ── Revoke / Delete ID Card ────────────────────────────────────────
    @Transactional // ✅ FIXED
    public void revokeCard(Long id) {
        StaffIdCard card = idCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ID Card not found: " + id));
        card.setStatus(StaffIdCard.CardStatus.REVOKED);
        idCardRepository.save(card);
    }

    // ── Private helpers ────────────────────────────────────────────────
    private String generateCardNumber(Long staffId) {
        return String.format("SNB-CARD-%05d", staffId);
    }

    private StaffIdCardResponse toResponse(StaffIdCard card) {
        Staff staff = card.getStaff(); // ✅ Ab @Transactional se session open rahega
        return StaffIdCardResponse.builder()
                .id(card.getId())
                .staffId(staff.getId())
                .cardNumber(card.getCardNumber())
                .staffName(card.getStaffName())
                .designation(card.getDesignation())
                .department(card.getDepartment())
                .bloodGroup(card.getBloodGroup())
                .officeAddress(card.getOfficeAddress())
                .issueDate(card.getIssueDate())
                .expiryDate(card.getExpiryDate())
                .roomAccess(card.getRoomAccess())
                .status(card.getStatus().name())
                .blockedReason(card.getBlockedReason())
                .employeeId(staff.getEmployeeId())
                .email(staff.getEmail())
                .phone(staff.getPhone())
                .branchName(staff.getBranchName())
                .createdAt(card.getCreatedAt())
                .updatedAt(card.getUpdatedAt())
                .build();
    }
}