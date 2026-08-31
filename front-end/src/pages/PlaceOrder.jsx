// ============================================================
// PlaceOrder.jsx — Shopping Cart & Order Placement Page
// ============================================================
//
// This page teaches:
//   - Complex state management (multiple related states)
//   - Array methods: find(), reduce(), filter(), map()
//   - Immutable state updates (never mutate state directly)
//   - Computing derived values from state (total price)
//   - Date objects and toISOString()
//
// FLOW:
//   1. Select store → load products from inventory
//   2. Browse products → add to cart (with stock validation)
//   3. Enter customer details
//   4. Place order → POST /store/placeOrder
//
// BACKEND ENDPOINTS:
//   GET  /inventory/{storeId}                              → Browse products
//   GET  /inventory/validate/{quantity}/{storeId}/{prodId}  → Check stock
//   POST /store/placeOrder                                  → Submit order
// ============================================================

import { useState } from 'react';
import { getStoreInventory, validateStock, placeOrder } from '../api/api';
import Toast from '../components/Toast';
import './PlaceOrder.css';

function PlaceOrder() {
  // ---------- STATE ----------

  const [storeId, setStoreId] = useState('');
  const [products, setProducts] = useState([]);       // Available products from store
  const [isLoaded, setIsLoaded] = useState(false);

  // ============================================================
  // SHOPPING CART STATE
  // ============================================================
  // The cart is an ARRAY of objects. Each item has:
  //   { id, name, price, quantity, total }
  //
  // IMPORTANT: When updating arrays in state, NEVER modify the
  // existing array (push, splice, etc.). Always create a NEW array.
  // This is called "immutable updates" — React needs a new reference
  // to detect changes and re-render.
  // ============================================================
  const [cart, setCart] = useState([]);

  // Customer information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Quantity inputs for each product (tracked by product ID)
  const [quantities, setQuantities] = useState({});

  const [toast, setToast] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // ============================================================
  // DERIVED STATE: Computed from existing state
  // ============================================================
  // Instead of storing the total in state (which could get out of sync),
  // we CALCULATE it from the cart every time the component renders.
  //
  // Array.reduce() "reduces" an array to a single value by
  // accumulating each item. Here, it sums up all item totals.
  //
  // Syntax: array.reduce((accumulator, currentItem) => newAccumulator, initialValue)
  // ============================================================
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

  // ---------- LOAD PRODUCTS ----------

  async function loadProducts() {
    if (!storeId) {
      setToast({ message: 'Please enter a Store ID', type: 'error' });
      return;
    }

    try {
      const data = await getStoreInventory(storeId);
      setProducts(data.products || []);
      setIsLoaded(true);
      setCart([]);
      setQuantities({});
      setOrderPlaced(false);
    } catch (error) {
      setToast({ message: 'Failed to load products', type: 'error' });
    }
  }

  // ---------- ADD TO CART ----------

  async function handleAddToCart(product) {
    const qty = parseInt(quantities[product.id]) || 1;

    if (qty <= 0) {
      setToast({ message: 'Quantity must be at least 1', type: 'error' });
      return;
    }

    // Validate stock BEFORE adding to cart
    try {
      const hasStock = await validateStock(qty, storeId, product.id);
      if (!hasStock) {
        setToast({ message: `Insufficient stock for ${product.name}`, type: 'error' });
        return;
      }
    } catch (error) {
      setToast({ message: 'Stock validation failed', type: 'error' });
      return;
    }

    // ============================================================
    // IMMUTABLE ARRAY UPDATE
    // ============================================================
    // Check if this product is already in the cart.
    // Array.find() returns the first item that matches, or undefined.
    // ============================================================
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      // Product already in cart — update its quantity
      // map() creates a NEW array where we change only the matching item
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + qty,
                total: (item.quantity + qty) * item.price,
              }
            : item
        )
      );
    } else {
      // New product — add to cart
      // [...cart, newItem] creates a new array with all existing items + the new one
      setCart([
        ...cart,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
          total: qty * product.price,
        },
      ]);
    }

    setToast({ message: `${product.name} added to cart`, type: 'success' });
  }

  // ---------- REMOVE FROM CART ----------

  function handleRemoveFromCart(productId) {
    // Array.filter() creates a NEW array with items that pass the test.
    // We keep all items EXCEPT the one being removed.
    setCart(cart.filter((item) => item.id !== productId));
  }

  // ---------- PLACE ORDER ----------

  async function handlePlaceOrder(e) {
    e.preventDefault();

    if (cart.length === 0) {
      setToast({ message: 'Cart is empty', type: 'error' });
      return;
    }

    try {
      // Build the order data matching PlaceOrderRequestDTO
      const orderData = {
        storeId: parseInt(storeId),
        customerName: customerInfo.name.trim(),
        customerEmail: customerInfo.email.trim(),
        customerPhone: customerInfo.phone.trim(),
        // new Date().toISOString() creates a timestamp like "2026-08-27T22:30:00.000Z"
        // We slice off the milliseconds and Z to match the backend format
        dateTime: new Date().toISOString().slice(0, 19),
        totalPrice: cartTotal,
        purchaseProduct: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.total,
        })),
      };

      const response = await placeOrder(orderData);

      if (response.message && response.message.includes('successfully')) {
        setToast({ message: response.message, type: 'success' });
        setOrderPlaced(true);
        setCart([]);
        setCustomerInfo({ name: '', email: '', phone: '' });
      } else {
        setToast({
          message: response.message || response.Error || 'Order failed',
          type: 'error',
        });
      }
    } catch (error) {
      setToast({ message: 'Failed to place order', type: 'error' });
    }
  }

  // ---------- RENDER ----------

  return (
    <div className="place-order-page">
      <h1>🛒 Place Order</h1>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* ===== STEP 1: SELECT STORE ===== */}
      <div className="store-selector">
        <label>Store ID:</label>
        <input
          type="number"
          min="1"
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          placeholder="Enter store ID"
        />
        <button className="btn btn-primary" onClick={loadProducts}>
          Load Products
        </button>
      </div>

      {orderPlaced && (
        <div className="order-success">
          <h2>✅ Order Placed Successfully!</h2>
          <p>The order has been recorded and inventory has been updated.</p>
          <button className="btn btn-primary" onClick={loadProducts}>
            Place Another Order
          </button>
        </div>
      )}

      {isLoaded && !orderPlaced && (
        <>
          {/* ===== STEP 2: BROWSE PRODUCTS ===== */}
          <h2 className="section-title">Available Products</h2>
          <div className="products-grid">
            {products.length === 0 ? (
              <p className="empty-message">No products available in this store.</p>
            ) : (
              products.map((product) => {
                const stock = product.inventory?.[0]?.stockLevel ?? 0;

                return (
                  <div key={product.id} className="product-card">
                    <div className="product-card-header">
                      <h3>{product.name}</h3>
                      <span className="price-badge">${product.price?.toFixed(2)}</span>
                    </div>
                    <p className="product-category">{product.category}</p>
                    <p className="product-stock">
                      Stock: <strong>{stock}</strong>
                    </p>
                    <div className="add-to-cart-row">
                      <input
                        type="number"
                        min="1"
                        max={stock}
                        value={quantities[product.id] || ''}
                        onChange={(e) =>
                          setQuantities({ ...quantities, [product.id]: e.target.value })
                        }
                        placeholder="Qty"
                        className="qty-input"
                      />
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={stock === 0}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ===== STEP 3: CART SUMMARY ===== */}
          {cart.length > 0 && (
            <div className="cart-section">
              <h2 className="section-title">🛒 Cart ({cart.length} items)</h2>
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td><strong>${item.total.toFixed(2)}</strong></td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRemoveFromCart(item.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="total-label">Grand Total:</td>
                    <td colSpan="2" className="total-value">${cartTotal.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>

              {/* ===== STEP 4: CUSTOMER DETAILS + SUBMIT ===== */}
              <form className="customer-form" onSubmit={handlePlaceOrder}>
                <h2>Customer Details</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      required
                      placeholder="e.g., Alice Johnson"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      required
                      placeholder="e.g., alice@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      required
                      placeholder="e.g., 9876543210"
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-warning place-order-btn">
                  Place Order — ${cartTotal.toFixed(2)}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PlaceOrder;
