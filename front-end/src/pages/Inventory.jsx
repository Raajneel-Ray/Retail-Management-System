// ============================================================
// Inventory.jsx — Inventory Management Page
// ============================================================
//
// This is the most COMPLEX page, teaching advanced React patterns:
//   - Managing many pieces of state together
//   - Re-fetching data after create/update/delete (mutations)
//   - Optional chaining (?.) for safely accessing nested data
//   - The CombinedRequest pattern (updating two things at once)
//
// BACKEND ENDPOINTS:
//   GET    /inventory/{storeId}                             → Get store inventory
//   POST   /inventory                                       → Add product to inventory
//   PUT    /inventory                                       → Update product + inventory
//   GET    /inventory/filter/{category}/{name}/{storeId}    → Filter
//   GET    /inventory/search/{name}/{storeId}               → Search
//   DELETE /inventory/{id}                                  → Remove from inventory
// ============================================================

import { useState } from 'react';
import {
  getStoreInventory,
  addInventory,
  updateInventory,
  filterStoreInventory,
  searchStoreInventory,
  deleteInventory,
} from '../api/api';
import Toast from '../components/Toast';
import './Inventory.css';

function Inventory() {
  // ---------- STATE ----------

  const [storeId, setStoreId] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false); // Has inventory been loaded?

  // Add to Inventory form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState({ productId: '', stockLevel: '' });

  // Edit Product + Inventory form
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({
    id: '', name: '', category: '', price: '', sku: '', stockLevel: '',
  });

  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Toast
  const [toast, setToast] = useState(null);

  const categories = ['Mobile', 'TV and AV', 'Home Appliances', 'Laptops and Monitors', 'Accessories'];

  // ---------- LOAD INVENTORY ----------

  async function loadInventory() {
    if (!storeId) {
      setToast({ message: 'Please enter a Store ID', type: 'error' });
      return;
    }

    try {
      const data = await getStoreInventory(storeId);
      setProducts(data.products || []);
      setIsLoaded(true);
      setSearchTerm('');
      setFilterCategory('');
    } catch (error) {
      setToast({ message: 'Failed to load inventory', type: 'error' });
    }
  }

  // ---------- SEARCH & FILTER ----------

  async function handleSearch() {
    if (!storeId) return;

    try {
      if (searchTerm.trim() && filterCategory) {
        const data = await filterStoreInventory(filterCategory, searchTerm.trim(), storeId);
        setProducts(data.product || []);
      } else if (searchTerm.trim()) {
        const data = await searchStoreInventory(searchTerm.trim(), storeId);
        setProducts(data.product || []);
      } else if (filterCategory) {
        const data = await filterStoreInventory(filterCategory, '', storeId);
        setProducts(data.product || []);
      } else {
        loadInventory();
      }
    } catch (error) {
      setToast({ message: 'Search failed', type: 'error' });
    }
  }

  // ---------- ADD TO INVENTORY ----------

  async function handleAddInventory(e) {
    e.preventDefault();

    try {
      // The backend expects: { stockLevel, product: { id }, store: { id } }
      const response = await addInventory({
        stockLevel: parseInt(addFormData.stockLevel),
        product: { id: parseInt(addFormData.productId) },
        store: { id: parseInt(storeId) },
      });

      if (response.message && response.message.includes('successfully')) {
        setToast({ message: response.message, type: 'success' });
        setShowAddForm(false);
        setAddFormData({ productId: '', stockLevel: '' });
        loadInventory(); // Refresh the table
      } else {
        setToast({ message: response.message || 'Failed to add', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to add to inventory', type: 'error' });
    }
  }

  // ---------- EDIT PRODUCT + INVENTORY ----------

  // ============================================================
  // OPTIONAL CHAINING: ?.
  // =====================
  // product.inventory[0]?.stockLevel
  //
  // The ?. operator safely accesses nested properties.
  // If inventory[0] is undefined, instead of crashing with
  // "Cannot read property 'stockLevel' of undefined",
  // it simply returns undefined. It's like saying:
  // "If this exists, access it; otherwise, give me undefined."
  // ============================================================

  function handleEdit(product) {
    const stockLevel = product.inventory?.[0]?.stockLevel || 0;

    setEditData({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      sku: product.sku,
      stockLevel: stockLevel.toString(),
    });
    setShowEditForm(true);
    setShowAddForm(false);
  }

  async function handleUpdateInventory(e) {
    e.preventDefault();

    try {
      // CombinedRequest format — updates BOTH product AND inventory
      const response = await updateInventory({
        product: {
          id: parseInt(editData.id),
          name: editData.name.trim(),
          category: editData.category,
          price: parseFloat(editData.price),
          sku: editData.sku.trim(),
        },
        inventory: {
          stockLevel: parseInt(editData.stockLevel),
          product: { id: parseInt(editData.id) },
          store: { id: parseInt(storeId) },
        },
      });

      if (response.message && response.message.includes('Successfully')) {
        setToast({ message: response.message, type: 'success' });
        setShowEditForm(false);
        loadInventory();
      } else {
        setToast({ message: response.message || 'Update failed', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Update failed', type: 'error' });
    }
  }

  // ---------- DELETE ----------

  async function handleDelete(productId) {
    if (!window.confirm('Remove this product from inventory?')) return;

    try {
      const response = await deleteInventory(productId);
      setToast({ message: response.message, type: 'success' });
      loadInventory();
    } catch (error) {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  }

  // ---------- HELPER: Get stock level color ----------

  function getStockClass(level) {
    if (level < 10) return 'stock-danger';
    if (level < 30) return 'stock-warning';
    return 'stock-good';
  }

  // ---------- RENDER ----------

  return (
    <div className="inventory-page">
      <h1>📋 Inventory Management</h1>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* ===== STORE SELECTOR ===== */}
      <div className="store-selector">
        <label htmlFor="store-id">Store ID:</label>
        <input
          id="store-id"
          type="number"
          min="1"
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          placeholder="Enter store ID"
        />
        <button className="btn btn-primary" onClick={loadInventory}>
          Load Inventory
        </button>
      </div>

      {/* Only show the rest AFTER inventory is loaded */}
      {isLoaded && (
        <>
          {/* ===== SEARCH & FILTER ===== */}
          <div className="search-filter-bar">
            <input
              type="text"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={handleSearch}>Search</button>
            <button className="btn btn-danger" onClick={loadInventory}>Clear</button>
          </div>

          {/* ===== ACTION BUTTONS ===== */}
          <div className="action-bar">
            <button
              className="btn btn-success"
              onClick={() => { setShowAddForm(!showAddForm); setShowEditForm(false); }}
            >
              {showAddForm ? '✕ Close' : '+ Add to Inventory'}
            </button>
          </div>

          {/* ===== ADD FORM ===== */}
          {showAddForm && (
            <form className="inventory-form" onSubmit={handleAddInventory}>
              <h2>Add Product to Store #{storeId} Inventory</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Product ID</label>
                  <input
                    type="number"
                    min="1"
                    value={addFormData.productId}
                    onChange={(e) => setAddFormData({ ...addFormData, productId: e.target.value })}
                    required
                    placeholder="e.g., 1"
                  />
                </div>
                <div className="form-group">
                  <label>Stock Level</label>
                  <input
                    type="number"
                    min="0"
                    value={addFormData.stockLevel}
                    onChange={(e) => setAddFormData({ ...addFormData, stockLevel: e.target.value })}
                    required
                    placeholder="e.g., 100"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary">Add to Inventory</button>
            </form>
          )}

          {/* ===== EDIT FORM ===== */}
          {showEditForm && (
            <form className="inventory-form" onSubmit={handleUpdateInventory}>
              <h2>Edit Product #{editData.id} + Inventory</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editData.price}
                    onChange={(e) => setEditData({ ...editData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    value={editData.sku}
                    onChange={(e) => setEditData({ ...editData, sku: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock Level</label>
                  <input
                    type="number"
                    min="0"
                    value={editData.stockLevel}
                    onChange={(e) => setEditData({ ...editData, stockLevel: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Update</button>
                <button type="button" className="btn btn-danger" onClick={() => setShowEditForm(false)}>Cancel</button>
              </div>
            </form>
          )}

          {/* ===== INVENTORY TABLE ===== */}
          <div className="table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>SKU</th>
                  <th>Stock Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-message">
                      No products in this store's inventory.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                    // Extract stock level from the inventory array
                    const stockLevel = product.inventory?.[0]?.stockLevel ?? 'N/A';

                    return (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>{product.name}</td>
                        <td><span className="category-badge">{product.category}</span></td>
                        <td>${product.price?.toFixed(2)}</td>
                        <td><code>{product.sku}</code></td>
                        <td>
                          <span className={`stock-badge ${getStockClass(stockLevel)}`}>
                            {stockLevel}
                          </span>
                        </td>
                        <td className="action-buttons">
                          <button className="btn btn-primary btn-sm" onClick={() => handleEdit(product)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(product.id)}>Remove</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default Inventory;
