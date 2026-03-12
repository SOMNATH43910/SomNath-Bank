package com.somnathbank.backend.service;

import com.somnathbank.backend.dto.request.FdRequest;
import com.somnathbank.backend.dto.response.FdResponse;
import com.somnathbank.backend.model.*;
import com.somnathbank.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FdService {

    private final FixedDepositRepository fdRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public FdResponse openFd(FdRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        Account account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new RuntimeException("Account not found!"));

        if (!account.getUser().getId().equals(user.getId()))
            throw new RuntimeException("This account does not belong to you!");

        if (account.getStatus() != Account.AccountStatus.ACTIVE)
            throw new RuntimeException("Account is not active!");

        if (account.getBalance().doubleValue() < request.getAmount())
            throw new RuntimeException("Insufficient balance!");

        double interestRate = getInterestRate(request.getTenureYears());
        int tenureMonths = request.getTenureYears() * 12;

        double principal = request.getAmount();
        double maturityAmount = principal *
                Math.pow(1 + interestRate / 100, request.getTenureYears());
        maturityAmount = Math.round(maturityAmount * 100.0) / 100.0;

        account.setBalance(account.getBalance().subtract(
                BigDecimal.valueOf(principal)));
        accountRepository.save(account);

        FixedDeposit fd = FixedDeposit.builder()
                .user(user)
                .account(account)
                .fdNumber(generateFdNumber())
                .principalAmount(BigDecimal.valueOf(principal))
                .interestRate(BigDecimal.valueOf(interestRate))
                .tenureMonths(tenureMonths)
                .maturityAmount(BigDecimal.valueOf(maturityAmount))
                .startDate(LocalDate.now())
                .maturityDate(LocalDate.now().plusYears(request.getTenureYears()))
                .status(FixedDeposit.FdStatus.ACTIVE)
                .build();

        fdRepository.save(fd);

        Notification notification = Notification.builder()
                .user(user)
                .title("Fixed Deposit Opened!")
                .message("Your FD of ₹" + principal +
                        " for " + request.getTenureYears() +
                        " year(s) at " + interestRate +
                        "% opened. Maturity amount: ₹" + maturityAmount)
                .type(Notification.NotificationType.FD)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);

        return mapToResponse(fd);
    }

    public List<FdResponse> getMyFds(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));
        return fdRepository.findByUser(user)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<FdResponse> getAllFds() {
        return fdRepository.findAll()
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public FdResponse breakFd(Long fdId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        FixedDeposit fd = fdRepository.findById(fdId)
                .orElseThrow(() -> new RuntimeException("FD not found!"));

        if (!fd.getUser().getId().equals(user.getId()))
            throw new RuntimeException("This FD does not belong to you!");

        if (fd.getStatus() != FixedDeposit.FdStatus.ACTIVE)
            throw new RuntimeException("FD is not active!");

        double penalty = fd.getPrincipalAmount().doubleValue() * 0.01;
        double refundAmount = fd.getPrincipalAmount().doubleValue() - penalty;

        Account account = fd.getAccount();
        // ✅ FIXED LINE:
        account.setBalance(account.getBalance().add(
                BigDecimal.valueOf(refundAmount)));
        accountRepository.save(account);

        fd.setStatus(FixedDeposit.FdStatus.BROKEN);
        fdRepository.save(fd);

        Notification notification = Notification.builder()
                .user(user)
                .title("FD Broken!")
                .message("Your FD broken. ₹" +
                        String.format("%.2f", refundAmount) +
                        " refunded after 1% penalty.")
                .type(Notification.NotificationType.FD)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);

        return mapToResponse(fd);
    }

    private double getInterestRate(int tenureYears) {
        if (tenureYears >= 5) return 8.0;
        if (tenureYears >= 3) return 7.5;
        if (tenureYears >= 2) return 7.0;
        return 6.5;
    }

    private String generateFdNumber() {
        String fdNumber;
        do {
            fdNumber = "FD" + (100000000 +
                    new Random().nextInt(900000000));
        } while (fdRepository.existsByFdNumber(fdNumber));
        return fdNumber;
    }

    private FdResponse mapToResponse(FixedDeposit fd) {
        FdResponse response = new FdResponse();
        response.setId(fd.getId());
        response.setCustomerName(fd.getUser().getFullName());
        response.setCustomerEmail(fd.getUser().getEmail());
        response.setAccountNumber(fd.getAccount().getAccountNumber());
        response.setPrincipalAmount(fd.getPrincipalAmount().doubleValue());
        response.setInterestRate(fd.getInterestRate().doubleValue());
        response.setTenureYears(fd.getTenureMonths() / 12);
        response.setMaturityAmount(fd.getMaturityAmount().doubleValue());
        response.setStartDate(fd.getStartDate());
        response.setMaturityDate(fd.getMaturityDate());
        response.setStatus(fd.getStatus().name());
        return response;
    }
}