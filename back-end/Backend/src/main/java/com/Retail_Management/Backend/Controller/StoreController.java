package com.Retail_Management.Backend.Controller;

import com.Retail_Management.Backend.Dto.PlaceOrderRequestDTO;
import com.Retail_Management.Backend.Model.Store;
import com.Retail_Management.Backend.Repository.CustomerRepository;
import com.Retail_Management.Backend.Repository.StoreRepository;
import com.Retail_Management.Backend.Service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.awt.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/store")
public class StoreController {
    @Autowired
    private StoreRepository storeRepository;
    @Autowired
    private OrderService orderService;
    @Autowired
    private CustomerRepository customerRepository;

    @PostMapping
    public Map<String, String> addStore(@RequestBody Store store) {
        Map<String, String> map = new HashMap<>();

        // Validate store name and address before calling save() to avoid database constraint failures and ID skips
        if (store == null || store.getName() == null || store.getName().trim().isEmpty()) {
            map.put("message", "Store name cannot be null or blank.");
            return map;
        }
        if (store.getAddress() == null || store.getAddress().trim().isEmpty()) {
            map.put("message", "Store address cannot be null or blank.");
            return map;
        }
        if (storeRepository.existsByName(store.getName().trim())) {
            map.put("message", "Store with name '" + store.getName() + "' already exists.");
            return map;
        }

        Store savedStore = storeRepository.save(store);
        map.put("message", "Store added successfully with id "+ savedStore.getId());
        return map;
    }

    @GetMapping("validate/{storeId}")
    public boolean validateStore(@PathVariable Long storeId )
    {
        Store store=storeRepository.findByid(storeId);
        if(store!=null)
        {
            return true;
        }
        return false;
    }

    @PostMapping("/placeOrder")
    public Map<String, String> placeOrder(@RequestBody PlaceOrderRequestDTO placeOrderRequestDTO) {
        Map<String, String> map = new HashMap<>();
        try{
            orderService.saveOrder(placeOrderRequestDTO);
            map.put("message","Order placed successfully");
        }
        catch(IllegalArgumentException e)
        {
            // Catches validation failures (e.g. insufficient stock, missing product/store)
            map.put("Error", e.getMessage());
        }
        catch(Exception e)
        {
            // Catches all general exceptions (replacing java.lang.Error to properly catch RuntimeExceptions)
            map.put("Error", "Failed to place order: " + e.getMessage());
        }
        return map;
    }
}
