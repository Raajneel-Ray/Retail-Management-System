package com.Retail_Management.Backend.Repository;

import com.Retail_Management.Backend.Model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
     Customer findByEmail(String email);
     Optional<Customer> findById(Long id);
     List<Customer> findByName(String name);
     Customer findByPhone(String phone);
}
