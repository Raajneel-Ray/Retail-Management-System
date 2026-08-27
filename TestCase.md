# API Test Cases for Retail Management System Backend

This document contains comprehensive API test cases designed for testing the backend Spring Boot REST APIs using **Postman** or **cURL** prior to front-end integration.

---

## 🚀 Environment Setup
- **Base URL**: `http://localhost:8080`
- **Database (SQL)**: MySQL (`inventory` database)
- **Database (NoSQL)**: MongoDB (`reviews` database)
- **Headers for POST / PUT requests**: `Content-Type: application/json`

---

## 📋 Summary of Endpoints

| Controller | HTTP Method | Endpoint Path | Description |
|---|---|---|---|
| **Store** | `POST` | `/store` | Add a new store |
| **Store** | `GET` | `/store/validate/{storeId}` | Validate store existence |
| **Store** | `POST` | `/store/placeOrder` | Place customer order and update stock |
| **Product** | `GET` | `/product` | Get all products |
| **Product** | `POST` | `/product` | Add a new product |
| **Product** | `GET` | `/product/product/{id}` | Get product by ID |
| **Product** | `PUT` | `/product` | Update an existing product |
| **Product** | `GET` | `/product/category/{name}/{category}` | Filter products by name and category |
| **Product** | `GET` | `/product/filter/{category}/{storeId}` | Filter products by category and store ID |
| **Product** | `GET` | `/product/searchProduct/{name}` | Search products by name keyword |
| **Product** | `DELETE` | `/product/{id}` | Delete product and related inventory/order items |
| **Inventory** | `POST` | `/inventory` | Add product entry to inventory |
| **Inventory** | `PUT` | `/inventory` | Update product & inventory combined |
| **Inventory** | `GET` | `/inventory/{storeId}` | Get all products for a specific store |
| **Inventory** | `GET` | `/inventory/filter/{category}/{name}/{storeId}` | Filter store inventory by category and name |
| **Inventory** | `GET` | `/inventory/search/{name}/{storeid}` | Search products in store inventory |
| **Inventory** | `GET` | `/inventory/validate/{quantity}/{storeId}/{productId}` | Validate available product quantity in store |
| **Inventory** | `DELETE` | `/inventory/{id}` | Delete product inventory entry |
| **Reviews** | `GET` | `/reviews` | Get all product reviews (MongoDB) |
| **Reviews** | `GET` | `/reviews/{storeId}/{productId}` | Get reviews for product in store (MongoDB) |

---

## 🧪 Detailed Test Cases

### 1. Store Management (`/store`)

#### TC-STORE-01: Add a New Store
- **Method**: `POST`
- **URL**: `http://localhost:8080/store`
- **Request Body**:
```json
{
  "name": "Downtown Electronics Hub"
}
```
- **Expected Status**: `200 OK`
- **Expected Response Body**:
```json
{
  "message": "Store added successfully with id 1"
}
```

---

#### TC-STORE-02: Validate Store Existence
- **Method**: `GET`
- **URL**: `http://localhost:8080/store/validate/1`
- **Expected Status**: `200 OK`
- **Expected Response Body**: `true`
- **Negative Case** (`/store/validate/999`): Returns `false`.

---

#### TC-STORE-03: Place an Order
- **Method**: `POST`
- **URL**: `http://localhost:8080/store/placeOrder`
- **Request Body**:
```json
{
  "storeId": 1,
  "customerName": "Alice Johnson",
  "customerEmail": "alice.johnson@example.com",
  "customerPhone": "9876543210",
  "dateTime": "2026-08-27T22:30:00",
  "totalPrice": 1599.98,
  "purchaseProduct": [
    {
      "id": 1,
      "name": "Galaxy S21",
      "price": 799.99,
      "quantity": 2,
      "total": 1599.98
    }
  ]
}
```
- **Expected Status**: `200 OK`
- **Expected Response Body**:
```json
{
  "message": "Order placed successfully"
}
```
- **Post-Condition Verification**: Customer created if non-existent, OrderDetails created, OrderItems created, and Inventory stock reduced by `quantity`.

---

### 2. Product Management (`/product`)

#### TC-PROD-01: List All Products
- **Method**: `GET`
- **URL**: `http://localhost:8080/product`
- **Expected Status**: `200 OK`
- **Expected Response Body**:
```json
{
  "products": [
    {
      "id": 1,
      "name": "Galaxy S21",
      "category": "Mobile",
      "price": 799.99,
      "sku": "SKU001"
    }
  ]
}
```

---

#### TC-PROD-02: Add a New Product
- **Method**: `POST`
- **URL**: `http://localhost:8080/product`
- **Request Body**:
```json
{
  "name": "Sony Wireless Earbuds",
  "category": "Accessories",
  "price": 199.99,
  "sku": "SKU999"
}
```
- **Expected Status**: `200 OK`
- **Expected Response Body**:
```json
{
  "message": "Product added successfully : SKU999"
}
```

---

#### TC-PROD-03: Add Duplicate Product (Existing Name)
- **Method**: `POST`
- **URL**: `http://localhost:8080/product`
- **Request Body**:
```json
{
  "name": "Galaxy S21",
  "category": "Mobile",
  "price": 799.99,
  "sku": "SKU001-NEW"
}
```
- **Expected Status**: `200 OK`
- **Expected Response Body**:
```json
{
  "message": "Product already present in database"
}
```

---

#### TC-PROD-04: Get Product by ID
- **Method**: `GET`
- **URL**: `http://localhost:8080/product/product/1`
- **Expected Status**: `200 OK`
- **Expected Response Body**:
```json
{
  "products": {
    "id": 1,
    "name": "Galaxy S21",
    "category": "Mobile",
    "price": 799.99,
    "sku": "SKU001"
  }
}
```

---

#### TC-PROD-05: Update Product
- **Method**: `PUT`
- **URL**: `http://localhost:8080/product`
- **Request Body**:
```json
{
  "id": 1,
  "name": "Galaxy S21 5G",
  "category": "Mobile",
  "price": 849.99,
  "sku": "SKU001"
}
```
- **Expected Status**: `200 OK`
- **Expected Response Body**:
```json
{
  "message": "Data updated successfully"
}
```

---

#### TC-PROD-06: Filter Products by Category and Name
- **Method**: `GET`
- **URL**: `http://localhost:8080/product/category/{name}/{category}`
- **Test Matrix**:
  1. Both Name & Category: `http://localhost:8080/product/category/Galaxy/Mobile`
  2. Name Only (`category` is `"null"`): `http://localhost:8080/product/category/Galaxy/null`
  3. Category Only (`name` is `"null"`): `http://localhost:8080/product/category/null/Mobile`
- **Expected Status**: `200 OK`

---

#### TC-PROD-07: Filter Products by Category and Store ID
- **Method**: `GET`
- **URL**: `http://localhost:8080/product/filter/Mobile/1`
- **Expected Status**: `200 OK`
- **Expected Response Body**:
```json
{
  "products": [
    {
      "id": 1,
      "name": "Galaxy S21",
      "category": "Mobile",
      "price": 799.99,
      "sku": "SKU001"
    }
  ]
}
```

---

#### TC-PROD-08: Search Product by Subname Keyword
- **Method**: `GET`
- **URL**: `http://localhost:8080/product/searchProduct/Galaxy`
- **Expected Status**: `200 OK`
- **Expected Response Body**: Returns list of products matching "Galaxy".

---

#### TC-PROD-09: Delete Product by ID
- **Method**: `DELETE`
- **URL**: `http://localhost:8080/product/1`
- **Expected Status**: `200 OK`
- **Expected Response Body**:
```json
{
  "message": "Id 1is deleted successfully."
}
```

---

### 3. Inventory Management (`/inventory`)

#### TC-INV-01: Save New Inventory Item
- **Method**: `POST`
- **URL**: `http://localhost:8080/inventory`
- **Request Body**:
```json
{
  "stockLevel": 100,
  "product": {
    "id": 1
  },
  "store": {
    "id": 1
  }
}
```
- **Expected Status**: `200 OK`
- **Expected Response Body**:
```json
{
  "message": "Product added to inventory successfully"
}
```

---

#### TC-INV-02: Attempt Duplicate Inventory Entry
- **Method**: `POST`
- **URL**: `http://localhost:8080/inventory`
- **Request Body**: (Same payload as TC-INV-01)
- **Expected Status**: `200 OK`
- **Expected Response Body**:
```json
{
  "message": "Data already present in inventory"
}
```

---

#### TC-INV-03: Combined Product & Inventory Update
- **Method**: `PUT`
- **URL**: `http://localhost:8080/inventory`
- **Request Body**:
```json
{
  "product": {
    "id": 1,
    "name": "Galaxy S21 5G",
    "category": "Mobile",
    "price": 849.99,
    "sku": "SKU001"
  },
  "inventory": {
    "stockLevel": 150,
    "product": {
      "id": 1
    },
    "store": {
      "id": 1
    }
  }
}
```
- **Expected Status**: `200 OK`
- **Expected Response Body**:
```json
{
  "message": "Successfully updated product with id: 1"
}
```

---

#### TC-INV-04: Get All Products in Store Inventory
- **Method**: `GET`
- **URL**: `http://localhost:8080/inventory/1`
- **Expected Status**: `200 OK`
- **Expected Response Body**:
```json
{
  "products": [...]
}
```

---

#### TC-INV-05: Filter Store Inventory by Category and Name
- **Method**: `GET`
- **URL**: `http://localhost:8080/inventory/filter/{category}/{name}/{storeId}`
- **Test Matrix**:
  1. Both category & name: `http://localhost:8080/inventory/filter/Mobile/Galaxy/1`
  2. Category null: `http://localhost:8080/inventory/filter/null/Galaxy/1`
  3. Name null: `http://localhost:8080/inventory/filter/Mobile/null/1`
- **Expected Status**: `200 OK`

---

#### TC-INV-06: Search Products in Store Inventory
- **Method**: `GET`
- **URL**: `http://localhost:8080/inventory/search/Galaxy/1`
- **Expected Status**: `200 OK`
- **Expected Response Body**:
```json
{
  "product": [...]
}
```

---

#### TC-INV-07: Validate Available Stock Quantity
- **Method**: `GET`
- **URL**: `http://localhost:8080/inventory/validate/5/1/1`
- **Parameters**: `validate/{quantity}/{storeId}/{productId}`
- **Expected Status**: `200 OK`
- **Expected Response Body**: `true` (if stock level >= 5), else `false`.

---

#### TC-INV-08: Delete Product Inventory
- **Method**: `DELETE`
- **URL**: `http://localhost:8080/inventory/1`
- **Expected Status**: `200 OK`
- **Expected Response Body**:
```json
{
  "message": "Deleted product successfully with id: 1"
}
```

---

### 4. Review Management (`/reviews` - MongoDB)

#### TC-REV-01: Get All Reviews
- **Method**: `GET`
- **URL**: `http://localhost:8080/reviews`
- **Expected Status**: `200 OK`
- **Expected Response Body**:
```json
{
  "reviews": [
    {
      "id": "64d...",
      "customerId": 45,
      "productId": 1,
      "storeId": 1,
      "rating": 5,
      "comment": "Amazing laptop! Very fast and lightweight."
    }
  ]
}
```

---

#### TC-REV-02: Get Reviews for Product in Store
- **Method**: `GET`
- **URL**: `http://localhost:8080/reviews/1/1`
- **Parameters**: `reviews/{storeId}/{productId}`
- **Expected Status**: `200 OK`
- **Expected Response Body**:
```json
{
  "reviews": [
    {
      "rating": 5,
      "comment": "Amazing laptop! Very fast and lightweight.",
      "customerName": "John Doe"
    }
  ]
}
```

---

### 5. Global Exception Handling

#### TC-ERR-01: Malformed JSON Payload
- **Method**: `POST`
- **URL**: `http://localhost:8080/product`
- **Request Body**: `{ "name": "Invalid Json"` *(missing closing brace)*
- **Expected Status**: `400 Bad Request`
- **Expected Response Body**:
```json
{
  "message": "Invalid input: The data provided is not valid."
}
```
