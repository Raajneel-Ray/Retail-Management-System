package com.Retail_Management.Backend.Controller;

import com.Retail_Management.Backend.Model.Product;
import com.Retail_Management.Backend.Repository.InventoryRepository;
import com.Retail_Management.Backend.Repository.ProductRepository;
import com.Retail_Management.Backend.Service.ServiceClass;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/product")
public class ProductController {
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private InventoryRepository inventoryRepository;
    @Autowired
    private ServiceClass serviceClass;

    /**Annotate with `@PostMapping` to handle POST requests for adding a new product.
     //    - Accept `Product` object in the request body.
     //    - Validate product existence using `validateProduct()` in `ServiceClass`.
     //    - Save the valid product using `save()` method of `ProductRepository`.
     //    - Catch exceptions (e.g., `DataIntegrityViolationException`) and return appropriate error message. **/
    @PostMapping
    public Map<String, String> addProduct(@RequestBody Product product) {
        Map<String, String> map = new HashMap<>();
        try {
            if(!serviceClass.validateProduct(product)) {
                productRepository.save(product);
                map.put("message","Product added successfully : " + product.getSku());
                return map;
            }
            map.put("message", "Product already present in database");
            return map;
        } catch (DataIntegrityViolationException e) {
            map.put("message", "SKU should be unique");
        }
        return map;
    }

    /**Annotate with `@GetMapping("/product/{id}")` to handle GET requests for retrieving a product by ID.
     //    - Accept product ID via `@PathVariable`.
     //    - Use `findById(id)` method from `ProductRepository` to fetch the product.
     //    - Return the product in a `Map<String, Object>` with key `products`. */
    @GetMapping("/product/{id}")
    public Map<String, Object> getProductbyId(@PathVariable Long id) {
        Map<String, Object> map = new HashMap<>();
        Product result = productRepository.findByid(id);
        System.out.println("result: "+result);
        map.put("products", result);
        return map;
    }

    /** - Annotate with `@PutMapping` to handle PUT requests for updating an existing product.
     //    - Accept updated `Product` object in the request body.
     //    - Use `save()` method from `ProductRepository` to update the product.
     //    - Return a success message with key `message` after updating the product. */
    @PutMapping
    public Map<String, String> updateProduct(@RequestBody Product product) {
        Map<String, String> map = new HashMap<>();
        if(product.getId() == null || !serviceClass.validateProductId(product.getId())) {
            map.put("message", "Product ID is missing or not present in the database. Cannot update.");
            return map;
        }
        try {
            productRepository.save(product);
            map.put("message", "Data updated successfully");
        } catch (DataIntegrityViolationException e) {
            map.put("message", "Database error: SKU might not be unique.");
        } catch (Exception e) {
            map.put("message", "An error occured during update.");
        }

        return map;
    }



}
