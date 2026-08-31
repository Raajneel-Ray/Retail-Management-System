package com.Retail_Management.Backend.Controller;

import com.Retail_Management.Backend.Dto.OrderResponseDTO;
import com.Retail_Management.Backend.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    /**
     * GET /orders/store/{storeId}
     * Fetch all orders for a given store, including order items.
     *
     * Optional query params for searching:
     *   ?name=John     → filter by customer name (partial, case-insensitive)
     *   ?email=john@.. → filter by customer email (exact, case-insensitive)
     */
    @GetMapping("/store/{storeId}")
    public ResponseEntity<List<OrderResponseDTO>> getOrdersByStore(
            @PathVariable Long storeId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email) {

        List<OrderResponseDTO> orders;

        if (name != null && !name.trim().isEmpty()) {
            orders = orderService.searchOrdersByCustomerName(storeId, name.trim());
        } else if (email != null && !email.trim().isEmpty()) {
            orders = orderService.searchOrdersByCustomerEmail(storeId, email.trim());
        } else {
            orders = orderService.getOrdersByStore(storeId);
        }

        return ResponseEntity.ok(orders);
    }
}
