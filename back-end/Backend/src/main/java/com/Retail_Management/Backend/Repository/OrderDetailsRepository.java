package com.Retail_Management.Backend.Repository;

import com.Retail_Management.Backend.Model.OrderDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDetailsRepository extends JpaRepository<OrderDetails, Long> {

    // Find all orders placed at a specific store
    List<OrderDetails> findByStoreId(Long storeId);

    // Search orders by customer name (case-insensitive partial match)
    @Query("SELECT o FROM OrderDetails o WHERE o.store.id = :storeId AND LOWER(o.customer.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<OrderDetails> findByStoreIdAndCustomerNameContaining(@Param("storeId") Long storeId, @Param("name") String name);

    // Search orders by customer email (exact match within a store)
    @Query("SELECT o FROM OrderDetails o WHERE o.store.id = :storeId AND LOWER(o.customer.email) = LOWER(:email)")
    List<OrderDetails> findByStoreIdAndCustomerEmail(@Param("storeId") Long storeId, @Param("email") String email);
}
