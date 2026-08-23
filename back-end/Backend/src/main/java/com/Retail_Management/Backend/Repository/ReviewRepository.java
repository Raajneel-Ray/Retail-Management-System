package com.Retail_Management.Backend.Repository;

import com.Retail_Management.Backend.Model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, Long> {
    List<Review> findByStoreIdAndProductId(Long storeId, Long productID);
}
