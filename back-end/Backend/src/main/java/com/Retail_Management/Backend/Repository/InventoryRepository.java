package com.Retail_Management.Backend.Repository;

import com.Retail_Management.Backend.Model.Inventory;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    @Query("SELECT i FROM Inventory i WHERE i.product.id= :productId AND i.store.id = :storeId")
    Inventory findByProductIdandStoreId(Long productId, Long storeId);

    List<Inventory> findByStore_Id(Long storeId); /** In Spring Data JPA, the underscore _ is a reserved character used
     to define traversal for nested properties. It tells Spring to look for the id field inside the Store object mapped
     to the Inventory entity (i.e., inventory.store.id). Using findByStore_Id makes this property traversal perfectly
     explicit and prevents any ambiguity! */


    @Modifying
    @Transactional
    @Query("DELETE FROM Inventory i WHERE i.product.id = :productId")
    void deleteByProductId(Long productId);

    /**Spring Data JPA does support automatic query generation for deletes (e.g., deleteByProduct_Id). So why write the @Query manually? Performance.
     When you rely on Spring Data JPA to automatically generate a deleteBy... method without a @Query, it does something you might not expect:
     First, it runs a SELECT query to fetch all the matching entities into memory.
     Then, it issues individual DELETE statements for each entity one by one. (If you have 1,000 inventory items, it runs 1,000 delete queries!). It does this to trigger any @PreRemove lifecycle events you might have.
     */
}
