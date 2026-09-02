// ============================================================
// api.js — All API Calls in One File
// ============================================================
//
// WHAT IS AN API?
// An API (Application Programming Interface) is a way for your
// frontend to talk to your backend. Your React app sends HTTP
// requests to the Spring Boot server, and gets back JSON data.
//
// WHAT IS fetch()?
// fetch() is the browser's built-in function for making HTTP requests.
// It returns a Promise — an object representing a future value.
//
// WHAT IS async/await?
// Instead of dealing with .then() chains, async/await lets you write
// asynchronous code that LOOKS like synchronous code.
//   - 'async' before a function means "this function returns a Promise"
//   - 'await' pauses execution until the Promise resolves
//
// WHAT IS JSON?
// JSON (JavaScript Object Notation) is a text format for data.
// Example: { "name": "Galaxy S21", "price": 799.99 }
// The backend sends JSON, and we parse it into JavaScript objects.
//
// HTTP METHODS:
//   GET    — "Give me data"         (reading/fetching)
//   POST   — "Here's new data"      (creating)
//   PUT    — "Update this data"     (modifying)
//   DELETE — "Remove this data"     (deleting)
// ============================================================

// The base URL of your Spring Boot backend.
// Change this if your backend runs on a different port.
const BASE_URL = 'http://localhost:8080';

// ============================================================
// HELPER FUNCTION
// ============================================================
// This helper reduces repetition. Most API calls follow the same
// pattern: fetch → check response → parse JSON.
// We'll use it inside our specific API functions.

async function fetchJson(url, options = {}) {
  try {
    const response = await fetch(url, options);
    // response.json() parses the JSON text into a JavaScript object
    const data = await response.json();
    return data;
  } catch (error) {
    // If the network is down or the backend isn't running, we catch the error
    console.error('API Error:', error);
    throw error;
  }
}

// ============================================================
// STORE APIs
// ============================================================

/**
 * Add a new store.
 * POST /store
 * Body: { name: "Store Name", address: "123 Main St" }
 *
 * WHAT ARE HEADERS?
 * Headers are metadata sent with the request. 'Content-Type' tells
 * the backend what format our data is in (JSON in this case).
 * Without it, the backend won't know how to read our request body.
 */
export async function addStore(store) {
  return fetchJson(`${BASE_URL}/store`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(store), // Convert JS object → JSON string
  });
}

/**
 * Check if a store exists by its ID.
 * GET /store/validate/{storeId}
 * Returns: true or false
 */
export async function validateStore(storeId) {
  const response = await fetch(`${BASE_URL}/store/validate/${storeId}`);
  // This endpoint returns a plain boolean, not JSON wrapped in an object
  const data = await response.json();
  return data;
}

/**
 * Place a customer order.
 * POST /store/placeOrder
 * Body: { storeId, customerName, customerEmail, customerPhone,
 *         dateTime, totalPrice, purchaseProduct: [{id, name, price, quantity, total}] }
 */
export async function placeOrder(orderData) {
  return fetchJson(`${BASE_URL}/store/placeOrder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
}

// ============================================================
// PRODUCT APIs
// ============================================================

/**
 * Get ALL products in the system.
 * GET /product
 * Returns: { products: [ { id, name, category, price, sku, inventory: [...] } ] }
 */
export async function getAllProducts() {
  return fetchJson(`${BASE_URL}/product`);
}

/**
 * Add a new product.
 * POST /product
 * Body: { name, category, price, sku }
 */
export async function addProduct(product) {
  return fetchJson(`${BASE_URL}/product`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
}

/**
 * Update an existing product.
 * PUT /product
 * Body: { id, name, category, price, sku }
 * NOTE: The 'id' field is REQUIRED for updates — it tells the backend
 * which product to modify.
 */
export async function updateProduct(product) {
  return fetchJson(`${BASE_URL}/product`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
}

/**
 * Delete a product by its ID.
 * DELETE /product/{id}
 * This also removes related inventory and order items on the backend.
 */
export async function deleteProduct(id) {
  return fetchJson(`${BASE_URL}/product/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Get a single product by ID.
 * GET /product/product/{id}
 * Returns: { products: { id, name, category, price, sku } }
 */
export async function getProductById(id) {
  return fetchJson(`${BASE_URL}/product/product/${id}`);
}

/**
 * Search products by name keyword.
 * GET /product/searchProduct/{name}
 * Returns: { products: [...] }
 */
export async function searchProducts(name) {
  return fetchJson(`${BASE_URL}/product/searchProduct/${name}`);
}

/**
 * Filter products by name AND/OR category.
 * GET /product/category/{name}/{category}
 *
 * IMPORTANT: The backend expects the literal string "null" (not empty)
 * if you want to skip a filter. For example:
 *   - Filter by category only: /product/category/null/Mobile
 *   - Filter by name only:     /product/category/Galaxy/null
 *   - Filter by both:          /product/category/Galaxy/Mobile
 */
export async function filterProducts(name, category) {
  const safeName = name || 'null';
  const safeCategory = category || 'null';
  return fetchJson(`${BASE_URL}/product/category/${safeName}/${safeCategory}`);
}

/**
 * Get products by category within a specific store.
 * GET /product/filter/{category}/{storeId}
 */
export async function getProductsByCategoryAndStore(category, storeId) {
  return fetchJson(`${BASE_URL}/product/filter/${category}/${storeId}`);
}

// ============================================================
// INVENTORY APIs
// ============================================================

/**
 * Get all products in a store's inventory.
 * GET /inventory/{storeId}
 * Returns: { products: [ { id, name, ..., inventory: [{ id, stockLevel }] } ] }
 */
export async function getStoreInventory(storeId) {
  return fetchJson(`${BASE_URL}/inventory/${storeId}`);
}

/**
 * Add a product to a store's inventory.
 * POST /inventory
 * Body: { stockLevel: 100, product: { id: 1 }, store: { id: 1 } }
 */
export async function addInventory(inventory) {
  return fetchJson(`${BASE_URL}/inventory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inventory),
  });
}

/**
 * Update both product details AND inventory stock level together.
 * PUT /inventory
 * This is a "combined update" — it updates the product table
 * AND the inventory table in one request.
 *
 * Body format (CombinedRequest DTO):
 * {
 *   product: { id, name, category, price, sku },
 *   inventory: { stockLevel, product: { id }, store: { id } }
 * }
 */
export async function updateInventory(data) {
  return fetchJson(`${BASE_URL}/inventory`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/**
 * Filter store inventory by category and/or name.
 * GET /inventory/filter/{category}/{name}/{storeId}
 * Pass "null" string if either category or name should be skipped.
 */
export async function filterStoreInventory(category, name, storeId) {
  const safeCategory = category || 'null';
  const safeName = name || 'null';
  return fetchJson(`${BASE_URL}/inventory/filter/${safeCategory}/${safeName}/${storeId}`);
}

/**
 * Search for products by name within a store's inventory.
 * GET /inventory/search/{name}/{storeId}
 */
export async function searchStoreInventory(name, storeId) {
  return fetchJson(`${BASE_URL}/inventory/search/${name}/${storeId}`);
}

/**
 * Validate if enough stock is available for a product in a store.
 * GET /inventory/validate/{quantity}/{storeId}/{productId}
 * Returns: true or false
 */
export async function validateStock(quantity, storeId, productId) {
  const response = await fetch(
    `${BASE_URL}/inventory/validate/${quantity}/${storeId}/${productId}`
  );
  const data = await response.json();
  return data;
}

/**
 * Remove a product from a store's inventory.
 * DELETE /inventory/{id}
 * NOTE: This deletes the inventory entry (by product ID), not the product itself.
 */
export async function deleteInventory(id) {
  return fetchJson(`${BASE_URL}/inventory/${id}`, {
    method: 'DELETE',
  });
}

// ============================================================
// ORDER APIs
// ============================================================

/**
 * Get all orders for a specific store.
 * GET /orders/store/{storeId}
 *
 * Optional query parameters for searching:
 *   ?name=John      → filter by customer name (partial, case-insensitive)
 *   ?email=john@..  → filter by customer email (exact, case-insensitive)
 *
 * Returns: [ { orderId, customerName, customerEmail, storeName, totalPrice, date, orderItems: [...] } ]
 */
export async function getOrdersByStore(storeId, { name, email } = {}) {
  // Build query string from optional search parameters
  const params = new URLSearchParams();
  if (name) params.append('name', name);
  if (email) params.append('email', email);

  const queryString = params.toString();
  const url = `${BASE_URL}/orders/store/${storeId}${queryString ? `?${queryString}` : ''}`;

  return fetchJson(url);
}

// ============================================================
// REVIEW APIs
// ============================================================

/**
 * Get ALL reviews across all stores (from MongoDB).
 * GET /reviews
 * Returns: { reviews: [ { id, customerId, productId, storeId, rating, comment } ] }
 */
export async function getAllReviews() {
  return fetchJson(`${BASE_URL}/reviews`);
}

/**
 * Get reviews for a specific product in a specific store.
 * GET /reviews/{storeId}/{productId}
 * Returns: { reviews: [ { rating, comment, customerName } ] }
 */
export async function getReviewsByStoreAndProduct(storeId, productId) {
  return fetchJson(`${BASE_URL}/reviews/${storeId}/${productId}`);
}
