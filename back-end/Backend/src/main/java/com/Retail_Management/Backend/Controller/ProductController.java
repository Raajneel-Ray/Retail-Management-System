package com.Retail_Management.Backend.Controller;

import com.Retail_Management.Backend.Model.Product;
import com.Retail_Management.Backend.Repository.InventoryRepository;
import com.Retail_Management.Backend.Repository.OrderItemRepository;
import com.Retail_Management.Backend.Repository.ProductRepository;
import com.Retail_Management.Backend.Service.ServiceClass;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
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
    @Autowired
    private OrderItemRepository orderItemRepository;

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
    public Map<String, Object> getProductById(@PathVariable Long id) {
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
            map.put("message", "An error occurred during update.");
        }

        return map;
    }

    /**- Annotate with `@GetMapping("/category/{name}/{category}")` to handle GET requests for filtering products by `name` and `category`.
     //    - Use conditional filtering logic if `name` or `category` is `"null"`.
     //    - Fetch products based on category using methods like `findByCategory()` or `findProductBySubNameAndCategory()`.
     //    - Return filtered products in a `Map<String, Object>` with key `products`. */
    @GetMapping("/category/{name}/{category}")
    public Map<String, Object> filterByCategoryProduct(@PathVariable String name, @PathVariable String category) {
        Map<String, Object> map = new HashMap<>();
        if(name.equals("null")) {
            map.put("products",productRepository.findByCategory(category));
            return map;
        } else if (category.equals("null")) {
            map.put("products", productRepository.findProductBySubName(name));
            return map;
        }
        map.put("products", productRepository.findProductBySubNameAndCategory(name, category));
        return map;
    }

    /**- Annotate with `@GetMapping` to handle GET requests to fetch all products.
     //    - Fetch all products using `findAll()` method from `ProductRepository`.
     //    - Return all products in a `Map<String, Object>` with key `products`. */
    @GetMapping
    public Map<String, Object> listProduct() {
        Map<String, Object> map = new HashMap<>();
        map.put("products", productRepository.findAll());
        return map;
    }

    /**- Annotate with `@GetMapping("filter/{category}/{storeId}")` to filter products by `category` and `storeId`.
     //    - Use `findProductByCategory()` method from `ProductRepository` to retrieve products.
     //    - Return filtered products in a `Map<String, Object>` with key `product`. */
    @GetMapping("filter/{category}/{storeId}")
    public Map<String, Object> getProductByCategoryAndStoreId(@PathVariable String category, @PathVariable Long storeId) {
        Map<String, Object> map = new HashMap<>();
        List<Product> result = productRepository.findByCategoryAndStoreId(storeId, category);
        map.put("products", result);
        return map;
    }

    /** - Annotate with `@DeleteMapping("/{id}")` to handle DELETE requests for removing a product by its ID.
     //    - Validate product existence using `ValidateProductId()` in `ServiceClass`.
     //    - Remove product from `Inventory` first using `deleteByProductId(id)` in `InventoryRepository`.
     //    - Remove product from `Product` using `deleteById(id)` in `ProductRepository`.
     //    - Return a success message with key `message` indicating product deletion. */
    @DeleteMapping("/{id}")
    public Map<String, String> deleteProduct(@PathVariable Long id) {
        Map<String, String> map = new HashMap<>();
        if(!serviceClass.validateProductId(id)) {
            map.put("message", "Id " + id + "not present in database.");
            return map;
        }
        inventoryRepository.deleteByProductId(id);
        orderItemRepository.deleteByProductId(id);
        productRepository.deleteById(id);

        map.put("message", "Id " + id + "is deleted successfully.");
        return map;
    }

    /**- Annotate with `@GetMapping("/searchProduct/{name}")` to search for products by `name`.
     //    - Use `findProductBySubName()` method from `ProductRepository` to search products by name.
     //    - Return search results in a `Map<String, Object>` with key `products`.*/
    @GetMapping("/searchProduct/{name}")
    public Map<String, Object> searchProduct(@PathVariable String name) {
        Map<String, Object> map = new HashMap<>();
        map.put("products", productRepository.findProductBySubName(name));
        return map;
    }

}
