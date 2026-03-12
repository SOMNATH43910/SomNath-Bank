package com.somnathbank.backend.repository;

import com.somnathbank.backend.model.Staff;
import com.somnathbank.backend.model.StaffSalary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StaffSalaryRepository extends JpaRepository<StaffSalary, Long> {

    // Ek staff ki saari salary history
    List<StaffSalary> findByStaffOrderByYearDescMonthDesc(Staff staff);

    // Saari salary records — latest pehle (Admin ke liye)
    List<StaffSalary> findAllByOrderByPaidAtDesc();

    // Check karo — kisi month/year mein already pay hua hai kya
    Optional<StaffSalary> findByStaffAndMonthAndYear(Staff staff, Integer month, Integer year);

    // Kisi month/year ki saari salaries
    List<StaffSalary> findByMonthAndYear(Integer month, Integer year);
}