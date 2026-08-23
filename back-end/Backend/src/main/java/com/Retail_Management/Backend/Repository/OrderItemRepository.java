package com.Retail_Management.Backend.Repository;

import com.Retail_Management.Backend.Model.OrderItem;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM OrderItem o WHERE o.product.id = :productId")
    void deleteByProductId(Long productId);
}
