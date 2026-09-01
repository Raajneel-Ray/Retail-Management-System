// ============================================================
// Orders.jsx — Order History Page
// ============================================================
//
// FEATURES:
//   1. Enter a store ID to load all orders for that store
//   2. Search orders by customer name (partial, case-insensitive)
//   3. Search orders by customer email (exact, case-insensitive)
//   4. Expandable order rows to view individual order items
//   5. Formatted dates and currency display
//
// BACKEND ENDPOINT:
//   GET /orders/store/{storeId}              → All orders for a store
//   GET /orders/store/{storeId}?name=John    → Search by customer name
//   GET /orders/store/{storeId}?email=j@..   → Search by customer email
//
// LEARNING FOCUS:
//   - Toggle state for expanding/collapsing rows
//   - URLSearchParams for building query strings
//   - Date formatting with toLocaleDateString()
//   - Nested data rendering (order → order items)
// ============================================================

import { useState } from 'react';
import { getOrdersByStore } from '../api/api';
import Toast from '../components/Toast';
import './Orders.css';

function Orders() {
  // ---------- STATE ----------

  const [storeId, setStoreId] = useState('');
  const [orders, setOrders] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Search state
  // searchType tracks whether the user is searching by 'name' or 'email'
  const [searchType, setSearchType] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');

  // ============================================================
  // EXPANDED ROWS — Tracking which orders are "open"
  // ============================================================
  // We use a Set to store order IDs that are currently expanded.
  // A Set is like an array but only stores UNIQUE values and has
  // fast .has() / .add() / .delete() operations.
  //
  // Why a Set instead of a single ID?
  // → So the user can expand MULTIPLE orders at the same time.
  // ============================================================
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  // Toast notification
  const [toast, setToast] = useState(null);

  // ---------- LOAD ORDERS ----------

  async function loadOrders() {
    if (!storeId) {
      setToast({ message: 'Please enter a Store ID', type: 'error' });
      return;
    }

    try {
      const data = await getOrdersByStore(storeId);
      setOrders(data || []);
      setIsLoaded(true);
      setSearchTerm('');
      setExpandedOrders(new Set());
    } catch (error) {
      setToast({ message: 'Failed to load orders', type: 'error' });
    }
  }

  // ---------- SEARCH ORDERS ----------

  async function handleSearch() {
    if (!storeId) {
      setToast({ message: 'Please load a store first', type: 'error' });
      return;
    }

    if (!searchTerm.trim()) {
      // If search is empty, reload all orders
      loadOrders();
      return;
    }

    try {
      // Build the search params object based on the selected search type.
      // Only one of 'name' or 'email' is sent at a time — the backend
      // checks name first, then email (see OrderController.java).
      const searchParams =
        searchType === 'name'
          ? { name: searchTerm.trim() }
          : { email: searchTerm.trim() };

      const data = await getOrdersByStore(storeId, searchParams);
      setOrders(data || []);
      setExpandedOrders(new Set());
    } catch (error) {
      setToast({ message: 'Search failed', type: 'error' });
    }
  }

  // ---------- TOGGLE ORDER EXPANSION ----------

  // ============================================================
  // IMMUTABLE STATE UPDATE PATTERN
  // ============================================================
  // React requires state to be updated immutably — you must create
  // a NEW object/array/set, not modify the existing one in place.
  //
  // Why? React compares the OLD state reference with the NEW one.
  // If they're the same object (even if contents changed), React
  // thinks nothing changed and SKIPS re-rendering.
  //
  // Here we create a new Set from the old one, modify it, then
  // call setExpandedOrders with the new Set.
  // ============================================================
  function toggleOrder(orderId) {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  }

  // ---------- HELPER: Format date for display ----------

  // ============================================================
  // DATE FORMATTING
  // ============================================================
  // The backend sends dates as ISO strings like "2026-08-27T22:30:00".
  // JavaScript's Date object can parse these, and toLocaleDateString()
  // formats them nicely based on the user's locale.
  //
  // Example output: "Aug 27, 2026, 10:30 PM"
  // ============================================================
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // ---------- RENDER ----------

  return (
    <div className="orders-page">
      <h1>📦 Order History</h1>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* ===== STORE SELECTOR ===== */}
      <div className="store-selector">
        <label htmlFor="order-store-id">Store ID:</label>
        <input
          id="order-store-id"
          type="number"
          min="1"
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          placeholder="Enter store ID"
        />
        <button className="btn btn-primary" onClick={loadOrders}>
          Load Orders
        </button>
      </div>

      {/* Only show search and table AFTER orders are loaded */}
      {isLoaded && (
        <>
          {/* ===== SEARCH BAR ===== */}
          <div className="orders-search-bar">
            {/*
              RADIO-LIKE SELECT: Switch between searching by name or email.
              Using a <select> keeps it compact and consistent with the
              existing UI patterns in this app.
            */}
            <select
              value={searchType}
              onChange={(e) => {
                setSearchType(e.target.value);
                setSearchTerm('');
              }}
              className="search-type-select"
            >
              <option value="name">Customer Name</option>
              <option value="email">Customer Email</option>
            </select>

            <input
              type="text"
              placeholder={
                searchType === 'name'
                  ? 'Search by customer name...'
                  : 'Search by customer email...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              // Allow pressing Enter to trigger search
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />

            <button className="btn btn-primary" onClick={handleSearch}>
              Search
            </button>
            <button className="btn btn-danger" onClick={loadOrders}>
              Clear
            </button>
          </div>

          {/* ===== STATUS MESSAGE ===== */}
          <p className="orders-count">
            Showing {orders.length} order(s) for Store #{storeId}
          </p>

          {/* ===== ORDERS TABLE ===== */}
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th></th> {/* Expand/collapse toggle column */}
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Store</th>
                  <th>Date</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-message">
                      No orders found for this store.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    /*
                      REACT FRAGMENT: <> ... </>
                      ===========================
                      Each order renders TWO table rows:
                        1. The main order summary row
                        2. The expandable detail row (order items)
                      
                      React requires a single root element per .map() item.
                      A Fragment (<> </>) wraps both rows without adding
                      an extra DOM element (which would break the <table> structure).
                    */
                    <OrderRow
                      key={order.orderId}
                      order={order}
                      isExpanded={expandedOrders.has(order.orderId)}
                      onToggle={() => toggleOrder(order.orderId)}
                      formatDate={formatDate}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// OrderRow — A Sub-Component for Each Order
// ============================================================
// Extracting this into its own component keeps the main Orders
// component cleaner and makes the expand/collapse logic easier
// to follow. This is a common React pattern called "component
// extraction" or "decomposition."
//
// PROPS:
//   - order: The order data object
//   - isExpanded: Boolean — is this row's detail panel open?
//   - onToggle: Function to call when the toggle button is clicked
//   - formatDate: Helper function passed from the parent
// ============================================================
function OrderRow({ order, isExpanded, onToggle, formatDate }) {
  return (
    <>
      {/* Main order summary row */}
      <tr className={`order-row ${isExpanded ? 'expanded' : ''}`} onClick={onToggle}>
        <td className="toggle-cell">
          {/*
            The arrow rotates when expanded.
            CSS handles the rotation via the 'expanded' class.
          */}
          <span className={`toggle-arrow ${isExpanded ? 'open' : ''}`}>▶</span>
        </td>
        <td>#{order.orderId}</td>
        <td className="customer-name">{order.customerName}</td>
        <td>{order.customerEmail}</td>
        <td>{order.storeName}</td>
        <td>{formatDate(order.date)}</td>
        <td className="order-total">${order.totalPrice?.toFixed(2)}</td>
      </tr>

      {/* Expandable detail row — only rendered when expanded */}
      {isExpanded && (
        <tr className="order-detail-row">
          {/*
            colSpan="7" makes this single <td> span all 7 columns,
            so the detail content stretches across the full table width.
          */}
          <td colSpan="7">
            <div className="order-items-panel">
              <h4>Order Items</h4>
              {order.orderItems && order.orderItems.length > 0 ? (
                <table className="order-items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.productName}</td>
                        <td><code>{item.productSku}</code></td>
                        <td>${item.price?.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td className="item-subtotal">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-items">No items in this order.</p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default Orders;
