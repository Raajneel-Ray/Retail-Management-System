package com.Retail_Management.Backend.Controller;

import com.Retail_Management.Backend.Dto.CombinedRequest;
import com.Retail_Management.Backend.Model.Inventory;
import com.Retail_Management.Backend.Model.Product;
import com.Retail_Management.Backend.Repository.InventoryRepository;
import com.Retail_Management.Backend.Repository.ProductRepository;
import com.Retail_Management.Backend.Service.ServiceClass;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;

import javax.naming.InvalidNameException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private InventoryRepository inventoryRepository;
    @Autowired
    private ServiceClass serviceClass;

    /**- This method handles HTTP PUT requests to update inventory for a product.
     - It takes a `CombinedRequest` (containing `Product` and `Inventory`) in the request body.
     - The product ID is validated, and if valid, the inventory is updated in the database.
     - If the inventory exists, update it and return a success message. If not, return a message indicating no data available.**/
    @PutMapping
    public Map<String, String> updateInventory(@RequestBody CombinedRequest request) {
        Product product = request.getProduct();
        Inventory inventory = request.getInventory();

        Map<String, String> map = new HashMap<>();
        System.out.println("Stock Level: " + inventory.getStockLevel());
        if(!serviceClass.validateProductId(product.getId())) { // validateproductID will return false if product donot exist
            map.put("message", "Id " + product.getId() + "not present in the database");
            return map;
        }
        productRepository.save(product);
        map.put("message", "Successfully updated product with id: " + product.getId());

        if(inventory != null) {
            try {
                Inventory result = serviceClass.getInventoryId(inventory); // fetches inventory record for given product and store
                if(result != null) {
                    inventory.setId(result.getId());
                    /** The incoming JSON request payload likely includes the new stockLevel, the product, and the store,
                     *  but it probably doesn't include the database's internal primary key (id). If you called save() right now,
                     *  Spring Data JPA would see a missing ID and attempt to INSERT a brand new duplicate row.
                     *  By taking the id from the found database record (result) and attaching it to the incoming inventory object,
                     *  you are telling Spring Data JPA exactly which row needs to be modified. */
                    inventoryRepository.save(inventory);
                } else {
                    map.put("message", "No data available for this product or store id");
                    return map;
                }
            } catch (DataIntegrityViolationException e){
                map.put("message", "Error: " + e);
                System.out.println(e);
                return map;
            }  catch (Exception e) {
                map.put("message", "Error: " + e);
                System.out.println(e);
                return map;
            }
        }
        return map;
    }

    /**-This method handles HTTP POST requests to save a new inventory entry.
     - It accepts an `Inventory` object in the request body.
     - It first validates whether the inventory already exists. If it exists, it returns a message stating so.
     -If it doesn’t exist, it saves the inventory and returns a success message.**/
    @PostMapping
    public Map<String, String> saveInventory(@RequestBody Inventory inventory) {
        Map<String, String> map = new HashMap<>();

        // Validate product existence, store existence, and duplicate inventory before calling save()
        // This prevents MySQL foreign key constraint violations that cause auto-increment ID skipping
        String validationError = serviceClass.validateInventoryForSave(inventory);
        if (validationError != null) {
            map.put("message", validationError);
            return map;
        }

        try {
            inventoryRepository.save(inventory);
            map.put("message", "Product added to inventory successfully");
        } catch (DataIntegrityViolationException e) {
            map.put("message", "Error: " + e.getMessage());
            System.out.println(e);
        } catch (Exception e) {
            map.put("message", "Error: " + e.getMessage());
            System.out.println(e);
        }
        return map;
    }

    /**- This method handles HTTP GET requests to retrieve products for a specific store.
     //    - It uses the `storeId` as a path variable and fetches the list of products from the database for the given store.
     //    - The products are returned in a `Map` with the key `"products"`.**/
    @GetMapping("/{storeId}")
    public Map<String, Object> getAllProducts(@PathVariable Long storeId) {
        Map<String, Object> map = new HashMap<>();
        List<Product> result = productRepository.findProductsByStoreId(storeId);
        map.put("products", result);
        return map;
    }

    /**  - This method handles HTTP GET requests to filter products by category and name.
    - If either the category or name is `"null"`, adjust the filtering logic accordingly.
    - Return the filtered products in the response with the key `"product"`. */
    @GetMapping("filter/{category}/{name}/{storeId}")
    public Map<String, Object> getProductByName(@PathVariable String category, @PathVariable String name,
                                                @PathVariable Long storeId) {
        Map<String, Object> map = new HashMap<>();
        if(category.equals("null")) {
            System.out.println("category is null");
            map.put("product", productRepository.findByNameLike(storeId, name));
            return map;
        } else if (name.equals("null")) {
            System.out.println("name is null");
            map.put("product", productRepository.findByCategoryAndStoreId(storeId, category));
            return map;
        }
        map.put("product", productRepository.findByNameAndCategory(storeId, name, category));
        return map;
    }

    /**- This method handles HTTP GET requests to search for products by name within a specific store.
   - It uses `name` and `storeId` as parameters and searches for products that match the `name` in the specified store.
   - The search results are returned in the response with the key `"product"`. */
    @GetMapping("search/{name}/{storeid}")
    public Map<String, Object> searchProduct(@PathVariable String name, @PathVariable Long storeid) {
        Map<String, Object> map = new HashMap<>();
        map.put("product", productRepository.findByNameLike(storeid, name));
        return map;
    }
    /**
     * - This method handles HTTP DELETE requests to delete a product by its ID.
     * - It first validates if the product exists. Removes the related inventory entry from the `InventoryRepository`.
     * - Returns a success message with the key `"message"` indicating successful deletion. */
    @DeleteMapping("/{id}")
    public Map<String, String> removeProduct(@PathVariable Long id) {
        Map<String, String> map = new HashMap<>();
        if (!serviceClass.validateProductId(id)) {
            map.put("message", "Id " + id + " not present in database");
            return map;
        }

        inventoryRepository.deleteByProductId(id);
        // not deleting the product because it's a parent class with child classes in order items entity. If deleting the
        // parent its necessary to delete the child class first as it has foreign key of the product class
        map.put("message", "Deleted product successfully with id: " + id);
        return map;
    }

    /**  - This method handles HTTP GET requests to validate if a specified quantity of a product is available in stock for a given store.
         - It checks the inventory for the product in the specified store and compares it to the requested quantity.
         - If sufficient stock is available, return `true`; otherwise, return `false`. */
    @GetMapping("validate/{quantity}/{storeId}/{productId}")
    public boolean validateQuantity(@PathVariable int quantity, @PathVariable long storeId,
                                    @PathVariable long productId) {
        Inventory result = inventoryRepository.findByProductIdandStoreId(productId, storeId);
        if(result != null && result.getStockLevel() >= quantity) {
            return true;
        }
        return false;
    }
}
