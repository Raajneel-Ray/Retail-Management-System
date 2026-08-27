package com.Retail_Management.Backend.Config;

import com.Retail_Management.Backend.Model.Review;
import com.Retail_Management.Backend.Repository.ReviewRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.List;

@Component
public class MongoDataInitializer implements CommandLineRunner {

    private final ReviewRepository reviewRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public MongoDataInitializer(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (reviewRepository.count() == 0) {
            System.out.println("MongoDB 'reviews' collection is empty. Auto-populating from reviews.json...");
            try (InputStream inputStream = new ClassPathResource("reviews.json").getInputStream()) {
                List<Review> reviews = objectMapper.readValue(inputStream, new TypeReference<List<Review>>() {});
                reviewRepository.saveAll(reviews);
                System.out.println("Successfully imported " + reviews.size() + " reviews into MongoDB!");
            } catch (Exception e) {
                System.err.println("Failed to import reviews.json into MongoDB: " + e.getMessage());
            }
        } else {
            System.out.println("MongoDB 'reviews' collection already contains " + reviewRepository.count() + " documents.");
        }
    }
}
