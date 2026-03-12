package com.somnathbank.backend.controller;

import com.somnathbank.backend.model.Staff;
import com.somnathbank.backend.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffRepository staffRepository;

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Staff>> getAllStaff() {
        return ResponseEntity.ok(staffRepository.findAll());
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Staff> addStaff(@RequestBody Staff staff) {
        return ResponseEntity.ok(staffRepository.save(staff));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Staff> updateStaff(@PathVariable Long id,
                                             @RequestBody Staff updated) {
        return staffRepository.findById(id).map(staff -> {
            staff.setFullName(updated.getFullName());
            staff.setDesignation(updated.getDesignation());
            staff.setDepartment(updated.getDepartment());
            staff.setSalary(updated.getSalary());
            staff.setStatus(updated.getStatus());
            staff.setBranchName(updated.getBranchName());
            staff.setPhone(updated.getPhone());
            return ResponseEntity.ok(staffRepository.save(staff));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteStaff(@PathVariable Long id) {
        staffRepository.deleteById(id);
        return ResponseEntity.ok("Staff deleted!");
    }

    @PutMapping("/salary/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Staff> updateSalary(@PathVariable Long id,
                                              @RequestParam Double salary) {
        return staffRepository.findById(id).map(staff -> {
            staff.setSalary(salary);
            return ResponseEntity.ok(staffRepository.save(staff));
        }).orElse(ResponseEntity.notFound().build());
    }
}