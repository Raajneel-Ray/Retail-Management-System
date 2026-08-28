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
    private final StoreRepository storeRepository;

    public ServiceClass(InventoryRepository inventoryRepository, ProductRepository productRepository, StoreRepository storeRepository) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.storeRepository = storeRepository;
    }

    /**
     * Comprehensive validation before saving a new Inventory entry:
     * 1. Validates that Product ID and Store ID are provided and not null.
     * 2. Validates that Product and Store exist in the MySQL database (preventing Foreign Key failure & ID skips).
     * 3. Validates that the (Product, Store) combination does not already exist.
     * Returns null if valid, or an error message string if invalid.
     */
    public String validateInventoryForSave(Inventory inventory) {
        if (inventory == null) {
            return "Inventory payload cannot be null";
        }
        if (inventory.getProduct() == null || inventory.getProduct().getId() == null) {
            return "Product ID is required";
        }
        if (inventory.getStore() == null || inventory.getStore().getId() == null) {
            return "Store ID is required";
        }
        if (!productRepository.existsById(inventory.getProduct().getId())) {
            return "Product with ID " + inventory.getProduct().getId() + " does not exist in database";
        }
        if (!storeRepository.existsById(inventory.getStore().getId())) {
            return "Store with ID " + inventory.getStore().getId() + " does not exist in database";
        }
        Inventory existing = inventoryRepository.findByProductIdandStoreId(
                inventory.getProduct().getId(),
                inventory.getStore().getId()
        );
        if (existing != null) {
            return "Data already present in inventory";
        }
        return null;
    }

    //This method checks whether an inventory record exists for a given product and store combination.
    public boolean validateInventory(Inventory inventory) {
        if (inventory == null || inventory.getProduct() == null || inventory.getProduct().getId() == null
                || inventory.getStore() == null || inventory.getStore().getId() == null) {
            return false;
        }
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
        if(result == null)
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

    public boolean validateSku(String sku) {
        return productRepository.existsBySku(sku);
    }

    //This method validates whether a store exists by its ID.
    public boolean validateStoreId(Long id) {
        return id != null && storeRepository.existsById(id);
    }
}
