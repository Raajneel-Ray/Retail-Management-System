package com.Retail_Management.Backend.Service;

import com.Retail_Management.Backend.Dto.PlaceOrderRequestDTO;
import com.Retail_Management.Backend.Dto.PurchaseProductDTO;
import com.Retail_Management.Backend.Model.*;
import com.Retail_Management.Backend.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    public void saveOrder(PlaceOrderRequestDTO placeOrderRequestDTO) {
        // retrieve or create customer -> check if it exists
        Customer existingCustomer = customerRepository.findByEmail(placeOrderRequestDTO.getCustomerEmail());
        Customer customer = new Customer();
        customer.setName(placeOrderRequestDTO.getCustomerName());
        customer.setEmail(placeOrderRequestDTO.getCustomerEmail());
        customer.setPhone(placeOrderRequestDTO.getCustomerPhone());

        if(existingCustomer == null) {
            customer = customerRepository.save(customer);
        }
        else {
            customer = existingCustomer;
        }

        // retrieve the store
        Store store = storeRepository.findById(placeOrderRequestDTO.getStoreId())
                .orElseThrow(() -> new RuntimeException("Store not found"));

        // create order details
        OrderDetails orderDetails = new OrderDetails();
        orderDetails.setCustomer(customer);
        orderDetails.setStore(store);
        orderDetails.setTotalPrice(placeOrderRequestDTO.getTotalPrice());
        orderDetails.setDate(java.time.LocalDateTime.now());

        orderDetails = orderDetailsRepository.save(orderDetails);

        // create and save order items product purchased.
        List<PurchaseProductDTO> purchaseProducts = placeOrderRequestDTO.getPurchaseProduct();
        for(PurchaseProductDTO productDTO : purchaseProducts) {
            OrderItem orderItem = new OrderItem();
            Inventory inventory = inventoryRepository.findByProductIdandStoreId(productDTO.getId(),
                    placeOrderRequestDTO.getStoreId());
            inventory.setStockLevel(inventory.getStockLevel() - productDTO.getQuantity());
            inventoryRepository.save(inventory);

            orderItem.setOrder(orderDetails);

            orderItem.setProduct(productRepository.findByid(productDTO.getId()));

            orderItem.setQuantity(productDTO.getQuantity());

            orderItem.setPrice(productDTO.getPrice() * productDTO.getQuantity());

            orderItemRepository.save(orderItem);
        }
    }

}
