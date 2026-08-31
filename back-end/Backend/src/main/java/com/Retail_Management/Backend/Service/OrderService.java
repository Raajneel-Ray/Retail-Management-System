package com.Retail_Management.Backend.Service;

import com.Retail_Management.Backend.Dto.OrderItemResponseDTO;
import com.Retail_Management.Backend.Dto.OrderResponseDTO;
import com.Retail_Management.Backend.Dto.PlaceOrderRequestDTO;
import com.Retail_Management.Backend.Dto.PurchaseProductDTO;
import com.Retail_Management.Backend.Model.*;
import com.Retail_Management.Backend.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private InventoryRepository inventoryRepository;
    @Autowired
    private OrderDetailsRepository orderDetailsRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private StoreRepository storeRepository;

    /**
     * Places an order for a customer:
     * - Pre-validates store, products, and sufficient stock for EVERY item BEFORE saving any entity.
     *   This ensures that no customer, order_details, or order_item rows are inserted if an item is out of stock,
     *   preventing transaction rollbacks and avoiding skipped auto-increment IDs.
     * - @Transactional guarantees ACID atomicity across customer, order, order items, and inventory updates.
     */
    @Transactional
    public void saveOrder(PlaceOrderRequestDTO placeOrderRequestDTO) {
        if (placeOrderRequestDTO == null) {
            throw new IllegalArgumentException("Order request cannot be null");
        }
        if (placeOrderRequestDTO.getStoreId() == null) {
            throw new IllegalArgumentException("Store ID is required");
        }
        if (placeOrderRequestDTO.getCustomerEmail() == null || placeOrderRequestDTO.getCustomerEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer email is required");
        }

        // retrieve the store and validate existence upfront
        Store store = storeRepository.findById(placeOrderRequestDTO.getStoreId())
                .orElseThrow(() -> new IllegalArgumentException("Store not found with id: " + placeOrderRequestDTO.getStoreId()));

        // Pre-validate all cart items and stock levels BEFORE saving customer or order_details
        List<PurchaseProductDTO> purchaseProducts = placeOrderRequestDTO.getPurchaseProduct();
        if (purchaseProducts == null || purchaseProducts.isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one product");
        }

        List<Inventory> inventoriesToUpdate = new ArrayList<>();
        List<Product> resolvedProducts = new ArrayList<>();

        for (PurchaseProductDTO productDTO : purchaseProducts) {
            if (productDTO.getId() == null) {
                throw new IllegalArgumentException("Product ID is required in purchase product list");
            }
            Product product = productRepository.findById(productDTO.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + productDTO.getId()));

            Inventory inventory = inventoryRepository.findByProductIdandStoreId(
                    productDTO.getId(),
                    placeOrderRequestDTO.getStoreId()
            );
            if (inventory == null) {
                throw new IllegalArgumentException("Product '" + product.getName() + "' is not available in store id: " + placeOrderRequestDTO.getStoreId());
            }
            if (inventory.getStockLevel() == null || inventory.getStockLevel() < productDTO.getQuantity()) {
                int available = (inventory.getStockLevel() != null) ? inventory.getStockLevel() : 0;
                throw new IllegalArgumentException("Insufficient stock for product '" + product.getName() + "'. Available: " + available + ", Requested: " + productDTO.getQuantity());
            }

            inventoriesToUpdate.add(inventory);
            resolvedProducts.add(product);
        }

        // retrieve or create customer -> check if it exists
        Customer existingCustomer = customerRepository.findByEmail(placeOrderRequestDTO.getCustomerEmail());
        Customer customer;
        if(existingCustomer == null) {
            Customer newCustomer = new Customer();
            newCustomer.setName(placeOrderRequestDTO.getCustomerName());
            newCustomer.setEmail(placeOrderRequestDTO.getCustomerEmail());
            newCustomer.setPhone(placeOrderRequestDTO.getCustomerPhone());
            customer = customerRepository.save(newCustomer);
        }
        else {
            customer = existingCustomer;
        }

        // create order details
        OrderDetails orderDetails = new OrderDetails();
        orderDetails.setCustomer(customer);
        orderDetails.setStore(store);
        orderDetails.setTotalPrice(placeOrderRequestDTO.getTotalPrice());
        orderDetails.setDate(java.time.LocalDateTime.now());

        orderDetails = orderDetailsRepository.save(orderDetails);

        // create and save order items product purchased & update stock levels
        for(int i = 0; i < purchaseProducts.size(); i++) {
            PurchaseProductDTO productDTO = purchaseProducts.get(i);
            Inventory inventory = inventoriesToUpdate.get(i);
            Product product = resolvedProducts.get(i);

            // Deduct stock
            inventory.setStockLevel(inventory.getStockLevel() - productDTO.getQuantity());
            inventoryRepository.save(inventory);

            // Create and save order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(orderDetails);
            orderItem.setProduct(product);
            orderItem.setQuantity(productDTO.getQuantity());
            orderItem.setPrice(productDTO.getPrice() * productDTO.getQuantity());

            orderItemRepository.save(orderItem);
        }
    }

    /**
     * Converts an OrderDetails entity to an OrderResponseDTO.
     */
    private OrderResponseDTO toOrderResponseDTO(OrderDetails order) {
        OrderResponseDTO dto = new OrderResponseDTO();
        dto.setOrderId(order.getId());
        dto.setCustomerName(order.getCustomer().getName());
        dto.setCustomerEmail(order.getCustomer().getEmail());
        dto.setStoreName(order.getStore().getName());
        dto.setTotalPrice(order.getTotalPrice());
        dto.setDate(order.getDate());

        if (order.getOrderItems() != null) {
            List<OrderItemResponseDTO> itemDTOs = order.getOrderItems().stream().map(item -> {
                OrderItemResponseDTO itemDTO = new OrderItemResponseDTO();
                itemDTO.setId(item.getId());
                itemDTO.setProductName(item.getProduct().getName());
                itemDTO.setProductSku(item.getProduct().getSku());
                itemDTO.setQuantity(item.getQuantity());
                itemDTO.setPrice(item.getPrice());
                return itemDTO;
            }).toList();
            dto.setOrderItems(itemDTOs);
        }

        return dto;
    }

    /**
     * Fetch all orders for a store.
     */
    public List<OrderResponseDTO> getOrdersByStore(Long storeId) {
        storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found with id: " + storeId));

        List<OrderDetails> orders = orderDetailsRepository.findByStoreId(storeId);
        return orders.stream().map(this::toOrderResponseDTO).toList();
    }

    /**
     * Search orders at a store by customer name (partial match).
     */
    public List<OrderResponseDTO> searchOrdersByCustomerName(Long storeId, String name) {
        storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found with id: " + storeId));

        List<OrderDetails> orders = orderDetailsRepository.findByStoreIdAndCustomerNameContaining(storeId, name);
        return orders.stream().map(this::toOrderResponseDTO).toList();
    }

    /**
     * Search orders at a store by customer email (exact match).
     */
    public List<OrderResponseDTO> searchOrdersByCustomerEmail(Long storeId, String email) {
        storeRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("Store not found with id: " + storeId));

        List<OrderDetails> orders = orderDetailsRepository.findByStoreIdAndCustomerEmail(storeId, email);
        return orders.stream().map(this::toOrderResponseDTO).toList();
    }

}
