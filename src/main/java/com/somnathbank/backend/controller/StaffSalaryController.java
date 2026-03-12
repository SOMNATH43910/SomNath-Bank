package com.somnathbank.backend.controller;

import com.somnathbank.backend.model.Staff;
import com.somnathbank.backend.model.StaffSalary;
import com.somnathbank.backend.repository.StaffRepository;
import com.somnathbank.backend.repository.StaffSalaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salary")
@RequiredArgsConstructor
public class StaffSalaryController {

    private final StaffSalaryRepository salaryRepository;
    private final StaffRepository staffRepository;

    // ✅ ADMIN: Salary pay karo
    @PostMapping("/admin/pay")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> paySalary(@RequestBody Map<String, Object> body) {

        Long staffId = Long.valueOf(body.get("staffId").toString());
        Integer month = body.get("month") != null
                ? Integer.valueOf(body.get("month").toString())
                : LocalDate.now().getMonthValue();
        Integer year  = body.get("year") != null
                ? Integer.valueOf(body.get("year").toString())
                : LocalDate.now().getYear();
        String remarks = body.get("remarks") != null
                ? body.get("remarks").toString() : "";
        String paymentTypeStr = body.get("paymentType") != null
                ? body.get("paymentType").toString() : "SALARY";

        // Custom amount for bonus/advance
        Double customAmount = body.get("amount") != null
                ? Double.valueOf(body.get("amount").toString()) : null;

        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found!"));

        StaffSalary.PaymentType paymentType;
        try {
            paymentType = StaffSalary.PaymentType.valueOf(paymentTypeStr);
        } catch (Exception e) {
            paymentType = StaffSalary.PaymentType.SALARY;
        }

        // ✅ Sirf SALARY ke liye duplicate check karo
        if (paymentType == StaffSalary.PaymentType.SALARY) {
            if (salaryRepository.findByStaffAndMonthAndYear(staff, month, year).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Salary already paid for this month!"));
            }
        }

        // BONUS/ADVANCE mein custom amount allow karo
        double amount = (customAmount != null && customAmount > 0)
                ? customAmount : staff.getSalary();

        StaffSalary salary = StaffSalary.builder()
                .staff(staff)
                .amount(amount)
                .month(month)
                .year(year)
                .remarks(remarks)
                .paymentType(paymentType)
                .status(StaffSalary.SalaryStatus.PAID)
                .build();

        salaryRepository.save(salary);

        return ResponseEntity.ok(Map.of(
                "message", paymentType.name() + " paid successfully!",
                "amount",  amount,
                "staff",   staff.getFullName()
        ));
    }

    // ✅ ADMIN: Ek staff ki salary history
    @GetMapping("/admin/history/{staffId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getSalaryHistory(@PathVariable Long staffId) {

        Staff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found!"));

        List<Map<String, Object>> result = salaryRepository
                .findByStaffOrderByYearDescMonthDesc(staff)
                .stream()
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id",         s.getId());
                    map.put("staffName",  s.getStaff().getFullName());
                    map.put("amount",     s.getAmount());
                    map.put("month",      s.getMonth());
                    map.put("year",       s.getYear());
                    map.put("remarks",    s.getRemarks() != null ? s.getRemarks() : "");
                    map.put("status",     s.getStatus().name());
                    map.put("paidAt",     s.getPaidAt() != null ? s.getPaidAt().toString() : "");
                    return map;
                })
                .toList();

        return ResponseEntity.ok(result);
    }

    // ✅ ADMIN: Saari salary records
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllSalaries() {

        List<Map<String, Object>> result = salaryRepository
                .findAllByOrderByPaidAtDesc()
                .stream()
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id",          s.getId());
                    map.put("staffId",     s.getStaff().getId());
                    map.put("staffName",   s.getStaff().getFullName());
                    map.put("designation", s.getStaff().getDesignation());
                    map.put("amount",      s.getAmount());
                    map.put("month",       s.getMonth());
                    map.put("year",        s.getYear());
                    map.put("remarks",     s.getRemarks() != null ? s.getRemarks() : "");
                    map.put("status",      s.getStatus().name());
                    map.put("paidAt",      s.getPaidAt() != null ? s.getPaidAt().toString() : "");
                    return map;
                })
                .toList();

        return ResponseEntity.ok(result);
    }

    // ✅ ADMIN: Kisi month ki summary
    @GetMapping("/admin/monthly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getMonthlySummary(
            @RequestParam(defaultValue = "0") int month,
            @RequestParam(defaultValue = "0") int year) {

        int m = month == 0 ? LocalDate.now().getMonthValue() : month;
        int y = year  == 0 ? LocalDate.now().getYear()       : year;

        List<StaffSalary> salaries = salaryRepository.findByMonthAndYear(m, y);

        double totalPaid = salaries.stream()
                .mapToDouble(StaffSalary::getAmount).sum();

        return ResponseEntity.ok(Map.of(
                "month",      m,
                "year",       y,
                "totalPaid",  totalPaid,
                "count",      salaries.size()
        ));
    }
}