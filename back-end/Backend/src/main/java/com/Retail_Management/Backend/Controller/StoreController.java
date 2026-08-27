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
        Store savedStore = storeRepository.save(store);
        Map<String, String> map = new HashMap<>();
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
        catch(Error e)
        {
            map.put("Error",""+e);
        }
        return map;
    }
}
