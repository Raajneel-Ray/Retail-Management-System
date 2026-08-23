package com.Retail_Management.Backend.Service;

import com.Retail_Management.Backend.Model.Inventory;
import com.Retail_Management.Backend.Model.Product;
import com.Retail_Management.Backend.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ServiceClass {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;

    public ServiceClass(InventoryRepository inventoryRepository, ProductRepository productRepository) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
    }
    //This method checks whether an inventory record exists for a given product and store combination.
    public boolean validateInventory(Inventory inventory) {
        Inventory result = inventoryRepository.findByProductIdandStoreId(inventory.getProduct().getId(),
                                                                        inventory.getStore().getId());
        if(result!=null) {
            return false;
        }
        return true;
    }

    //This method checks whether a product exists by its name.
    public boolean validateProduct(Product product) {
        Product result = productRepository.findByName(product.getName());
        if(result!=null)
        {
            return false;
        }
        return true;
    }

    //This method validates whether a product exists by its ID.
    public boolean validateProductId(Long id) {
        Product result = productRepository.findByid(id);
        if(result == null) {
            return  false;
        }
        return true;
    }

    //This method fetches the inventory record for a given product and store combination.
    public Inventory getInventoryId(Inventory inventory) {
        Inventory result = inventoryRepository.findByProductIdandStoreId(inventory.getProduct().getId(),
                                                                        inventory.getStore().getId());
        return result;
    }
}
