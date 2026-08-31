package com.Retail_Management.Backend.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS Configuration for the Retail Management System backend.
 *
 * WHY WE NEED THIS:
 * When your React frontend (running on localhost:5173) makes API calls to
 * the Spring Boot backend (running on localhost:8080), the browser blocks
 * the request because they are on DIFFERENT ORIGINS (different ports).
 *
 * This is called the "Same-Origin Policy" — a browser security feature.
 * CORS (Cross-Origin Resource Sharing) tells the browser: "It's OK,
 * allow requests from this other origin."
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")               // Apply to all endpoints
                .allowedOrigins("*")              // Allow requests from any origin
                .allowedMethods("GET", "POST", "PUT", "DELETE")  // HTTP methods the frontend uses
                .allowedHeaders("*");             // Allow all request headers
    }
}
