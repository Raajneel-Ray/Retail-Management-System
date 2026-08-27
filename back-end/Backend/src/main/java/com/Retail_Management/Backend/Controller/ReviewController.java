package com.Retail_Management.Backend.Controller;

import com.Retail_Management.Backend.Model.Customer;
import com.Retail_Management.Backend.Model.Review;
import com.Retail_Management.Backend.Repository.CustomerRepository;
import com.Retail_Management.Backend.Repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/reviews")
public class ReviewController {
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private CustomerRepository customerRepository;

    /**- Annotate with `@GetMapping("/{storeId}/{productId}")` to fetch reviews for a specific product in a store by `storeId` and `productId`.
     //    - Accept `storeId` and `productId` via `@PathVariable`.
     //    - Fetch reviews using `findByStoreIdAndProductId()` method from `ReviewRepository`.
     //    - Filter reviews to include only `comment`, `rating`, and the `customerName` associated with the review.
     //    - Use `findById(review.getCustomerId())` from `CustomerRepository` to get customer name.
     //    - Return filtered reviews in a `Map<String, Object>` with key `reviews`. */
    @GetMapping("/{storeId}/{productId}")
    public Map<String, Object> getReview(@PathVariable Long storeId, @PathVariable Long productId) {
        Map<String, Object> map = new HashMap<>();
        List<Review> reviews = reviewRepository.findByStoreIdAndProductId(storeId, productId);
        List<Map<String, Object>> filteredReviews = new ArrayList<>();
        // for each review fetch the comment and rating
        for(Review review: reviews) {
            Map<String, Object> reviewTemp = new HashMap<>();
            reviewTemp.put("comment", review.getComment());
            reviewTemp.put("rating", review.getRating());

            // fetching the customer name
            Customer customer = customerRepository.findByid(review.getCustomerId());
            if(customer != null) {
                reviewTemp.put("customerName", customer.getName());
            } else {
                reviewTemp.put("customerName", "Unknown");
            }
            filteredReviews.add(reviewTemp);
        }
        map.put("reviews", filteredReviews);
        return map;
    }

    // get all reviews across all store
    @GetMapping
    public Map<String,Object> getAllReviews()
    {
        Map<String,Object> map=new HashMap<>();
        map.put("reviews",reviewRepository.findAll());
        return map;
    }
}
