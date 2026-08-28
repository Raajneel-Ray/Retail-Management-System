package com.Retail_Management.Backend.Repository;

import com.Retail_Management.Backend.Model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {

    Store findByid(Long id);

    // Check whether a store with the given name exists to prevent duplicate insertion failures and ID gaps
    boolean existsByName(String name);

    @Query("SELECT DISTINCT s FROM Store s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :pname, '%'))")
    List<Store> findBySubName(@Param("pname") String pname);
}
