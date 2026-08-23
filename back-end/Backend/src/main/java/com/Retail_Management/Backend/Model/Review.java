package com.Retail_Management.Backend.Model;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "reviews")
public class Review {
    @NotNull(message = "Customer cannot be null.")
    private Long customerId;

    @NotNull(message = "Product cannot be null.")
    private Long productId;

    @NotNull(message = "Store cannot be null.")
    private Long storeId;

    @NotNull(message = "Rating cannot be null.")
    @Min(value = 1, message = "Minimum Rating must be 1") @Max(value = 5, message = "Maximum Rating should not exceed 5")
    private Integer rating;

    private String comment;

    public Review() {}

    public Review(Long customerId, Long productId, Long storeId, Integer rating, String comment) {
        this.customerId = customerId;
        this.productId = productId;
        this.storeId = storeId;
        this.rating = rating;
        this.comment = comment;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Long getStoreId() {
        return storeId;
    }

    public void setStoreId(Long storeId) {
        this.storeId = storeId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
