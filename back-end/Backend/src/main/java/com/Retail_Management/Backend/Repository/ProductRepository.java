package com.Retail_Management.Backend.Repository;

import com.Retail_Management.Backend.Model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsBySku(String sku);
    //Spring Data JPA translates existsBySku("ABC-123") into an optimized EXISTS SQL query that avoids loading entity data into memory:
    //SELECT CASE WHEN COUNT(p.id) > 0 THEN TRUE ELSE FALSE END
    //FROM products p
    //WHERE p.sku = ?

    // Checks if a product with the same name already exists to prevent duplicate insert attempts and ID skipping
    boolean existsByName(String name);

    List<Product> findAll();

    List<Product> findByCategory(String category);

    List<Product> findByPriceBetween(Double minPrice, Double maxPrice);

    List<Product> findBySku(String sku);

    Product findByName(String name);

    Product findByid(Long id);

    // Find products by a name pattern for a specific store.
    @Query("SELECT DISTINCT i.product FROM Inventory i WHERE i.store.id = :storeId AND LOWER(i.product.name) " +
            "LIKE LOWER(CONCAT('%', :pname, '%'))")
    List<Product> findByNameLike(@Param("storeId") Long storeId, @Param("pname") String pname);

    //Find products by name and category for a specific store
    @Query("SELECT DISTINCT i.product FROM Inventory i WHERE i.store.id = :storeId AND LOWER(i.product.name) " +
            "LIKE LOWER(CONCAT('%', :pname, '%')) AND i.product.category = :category")
    List<Product> findByNameAndCategory(@Param("storeId") Long storeId, @Param("pname") String pname, @Param("category")  String category);

    // find product by category for a specific store
    @Query("SELECT DISTINCT i.product FROM Inventory i WHERE i.store.id = :storeId AND i.product.category = :category")
    List<Product> findByCategoryAndStoreId(@Param("storeId") long storeId, @Param("category") String category);

    // find products by sub name
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :pname, '%'))")
    List<Product> findProductBySubName(@Param("pname") String pname);

    @Query("SELECT DISTINCT i.product FROM Inventory i WHERE i.store.id = :storeId")
    List<Product> findProductsByStoreId(@Param("storeId") Long storeId);

    @Query("SELECT DISTINCT i.product FROM Inventory i WHERE i.product.category = :category AND i.store.id = :storeId")
    List<Product> findProductByCategory(@Param("category") String category, @Param("storeId") long storeId);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :pname, '%')) AND p.category = :category")
    List<Product> findProductBySubNameAndCategory(@Param("pname") String pname, @Param("category") String category);
}
