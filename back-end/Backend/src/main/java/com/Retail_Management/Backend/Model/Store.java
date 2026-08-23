package com.Retail_Management.Backend.Model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Entity
@Table(name = "store")
public class Store {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Store name cannot be null.")
    @NotBlank(message = "Store name cannot be blank.")
    private String name;

    @NotNull(message = "Store address cannot be null.")
    @NotBlank(message = "Store address cannot be blank.")
    private String address;

    @OneToMany(mappedBy = "store", fetch = FetchType.EAGER)
    @JsonManagedReference("inventory-store")
    private List<Inventory> inventories;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public List<Inventory> getInventories() {
        return inventories;
    }

    public void setInventories(List<Inventory> inventories) {
        this.inventories = inventories;
    }

    public Store() {}

    public Store(String name, String address) {
        this.name = name;
        this.address = address;
    }
}
