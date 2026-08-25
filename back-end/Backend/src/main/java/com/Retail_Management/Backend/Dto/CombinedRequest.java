package com.Retail_Management.Backend.Dto;

import com.Retail_Management.Backend.Model.Inventory;
import com.Retail_Management.Backend.Model.Product;

public class CombinedRequest {
    private Product product;
    private Inventory inventory;

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Inventory getInventory() {
        return inventory;
    }

    public void setInventory(Inventory inventory) {
        this.inventory = inventory;
    }
}
