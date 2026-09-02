// ============================================================
// Products.jsx — Product Management Page (CRUD + Search/Filter)
// ============================================================
//
// This is the MOST feature-rich page and covers the most React concepts:
//   - useState for managing multiple pieces of state
//   - useEffect for loading data on mount
//   - Controlled components (form inputs tied to state)
//   - Event handlers (onClick, onSubmit, onChange)
//   - Conditional rendering (showing/hiding UI based on state)
//   - Array methods: map(), filter()
//   - async/await for API calls
//
// BACKEND ENDPOINTS USED:
//   GET    /product                          → List all
//   POST   /product                          → Add new
//   PUT    /product                          → Update existing
//   DELETE /product/{id}                     → Delete
//   GET    /product/searchProduct/{name}     → Search
//   GET    /product/category/{name}/{cat}    → Filter
// ============================================================

import { useState, useEffect } from 'react';
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  filterProducts,
} from '../api/api';
import Toast from '../components/Toast';
import './Products.css';

// ============================================================
// REACT CONCEPT: useState
// ========================
// useState lets a component "remember" values between renders.
// Syntax: const [value, setValue] = useState(initialValue);
//
//   - 'value' is the current state
//   - 'setValue' is a function to UPDATE the state
//   - When you call setValue(), React RE-RENDERS the component
//     with the new value. This is how the UI stays in sync with data.
// ============================================================

function Products() {
  // ---------- STATE ----------
  // All the data this component needs to track:

  const [products, setProducts] = useState([]);        // The list of products to display
  const [showForm, setShowForm] = useState(false);      // Whether the add/edit form is visible
  const [editingProduct, setEditingProduct] = useState(null); // The product being edited (null = adding new)
  const [toast, setToast] = useState(null);             // Toast notification { message, type }

  // Form fields — each input is "controlled" by state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    sku: '',
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Available product categories (matches your backend data)
  const categories = ['Mobile', 'TV and AV', 'Home Appliances', 'Laptops and Monitors', 'Accessories'];

  // ============================================================
  // REACT HOOK: useEffect
  // =====================
  // useEffect runs code AFTER the component renders.
  // The empty dependency array [] means "run once on mount."
  //
  // "Mounting" = when the component first appears on screen.
  // We load all products when the page first opens.
  // ============================================================
  useEffect(() => {
    loadProducts();
  }, []);

  // ---------- DATA LOADING FUNCTIONS ----------

  async function loadProducts() {
    try {
      const data = await getAllProducts();
      // The API returns { products: [...] }
      setProducts(data.products || []);
    } catch (error) {
      setToast({ message: 'Failed to load products', type: 'error' });
    }
  }

  // ---------- SEARCH AND FILTER ----------

  async function handleSearch() {
    if (!searchTerm.trim() && !selectedCategory) {
      // If both are empty, load all products
      loadProducts();
      return;
    }

    try {
      let data;
      if (searchTerm.trim() && selectedCategory) {
        // Both search term and category — use combined filter
        data = await filterProducts(searchTerm.trim(), selectedCategory);
      } else if (searchTerm.trim()) {
        // Only search term
        data = await searchProducts(searchTerm.trim());
      } else {
        // Only category
        data = await filterProducts('', selectedCategory);
      }
      setProducts(data.products || []);
    } catch (error) {
      setToast({ message: 'Search failed', type: 'error' });
    }
  }

  function handleClearFilters() {
    setSearchTerm('');
    setSelectedCategory('');
    loadProducts();
  }

  // ---------- FORM HANDLING ----------

  // ============================================================
  // REACT CONCEPT: CONTROLLED COMPONENTS
  // =====================================
  // In React, form inputs are "controlled" when their value comes
  // from state (value={formData.name}) and changes update state
  // (onChange → setFormData). This means React is the "single source
  // of truth" for the input's value.
  //
  // WHY? Because we can easily:
  //   1. Validate the input before submission
  //   2. Transform the data (trim spaces, format, etc.)
  //   3. Reset the form by resetting state
  // ============================================================

  function handleInputChange(e) {
    // e.target is the input element that fired the event
    // e.target.name is the input's 'name' attribute
    // e.target.value is what the user typed
    const { name, value } = e.target;

    // SPREAD OPERATOR: { ...formData } creates a COPY of the object,
    // then [name]: value overwrites just one property.
    // We never mutate state directly — always create a new object.
    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(e) {
    // e.preventDefault() stops the browser from reloading the page
    // (the default behavior when a form is submitted).
    e.preventDefault();

    try {
      const productData = {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),  // Convert string to number
        sku: formData.sku.trim(),
      };

      let response;

      if (editingProduct) {
        // UPDATING: include the ID so the backend knows which product
        response = await updateProduct({ ...productData, id: editingProduct.id });
      } else {
        // ADDING: no ID needed, backend auto-generates it
        response = await addProduct(productData);
      }

      // Check the backend response message
      if (response.message && (response.message.includes('successfully') || response.message.includes('updated'))) {
        setToast({ message: response.message, type: 'success' });
      } else {
        setToast({ message: response.message || 'Operation completed', type: 'error' });
      }

      // Reset form and reload products
      resetForm();
      loadProducts();
    } catch (error) {
      setToast({ message: 'Operation failed', type: 'error' });
    }
  }

  function handleEdit(product) {
    // Populate the form with the product's current data
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      sku: product.sku,
    });
    setShowForm(true);
  }

  async function handleDelete(id) {
    // window.confirm() shows a browser dialog asking "Are you sure?"
    // It returns true if the user clicks OK, false if Cancel.
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await deleteProduct(id);
      setToast({ message: response.message, type: 'success' });
      loadProducts();
    } catch (error) {
      setToast({ message: 'Delete failed', type: 'error' });
    }
  }

  function resetForm() {
    setFormData({ name: '', category: '', price: '', sku: '' });
    setEditingProduct(null);
    setShowForm(false);
  }

  // ---------- RENDER (JSX) ----------

  return (
    <div className="products-page">
      <h1>📦 Product Management</h1>

      {/* Toast notification — only shows when toast state is not null */}
      {/*
        CONDITIONAL RENDERING:
        {toast && <Toast ... />}
        
        This is called "short-circuit evaluation."
        If toast is null (falsy), the && stops and renders nothing.
        If toast has a value (truthy), it renders the <Toast> component.
      */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ===== SEARCH & FILTER BAR ===== */}
      <div className="search-filter-bar">
        <input
          type="text"
          placeholder="Search products by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        <button className="btn btn-danger" onClick={handleClearFilters}>Clear</button>
      </div>

      {/* ===== ADD PRODUCT BUTTON ===== */}
      <button
        className="btn btn-success add-btn"
        onClick={() => {
          resetForm();
          setShowForm(!showForm);
        }}
      >
        {showForm ? '✕ Close Form' : '+ Add Product'}
      </button>

      {/* ===== ADD / EDIT FORM ===== */}
      {/*
        CONDITIONAL RENDERING:
        The form only appears when showForm is true.
        This is like an if-statement for UI.
      */}
      {showForm && (
        <form className="product-form" onSubmit={handleSubmit}>
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>

          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., Galaxy S21"
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            {/*
              htmlFor connects the <label> to the <select>/<input> by ID.
              This is an ACCESSIBILITY feature — clicking the label
              focuses the associated input.
            */}
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleInputChange}
              required
              placeholder="e.g., 799.99"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sku">SKU</label>
            <input
              id="sku"
              name="sku"
              type="text"
              value={formData.sku}
              onChange={handleInputChange}
              required
              placeholder="e.g., SKU001"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
            <button type="button" className="btn btn-danger" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ===== PRODUCTS TABLE ===== */}
      <div className="table-container">
        <table className="products-table">
          {/*
            HTML TABLE STRUCTURE:
            <table>
              <thead> — Table header (column names)
                <tr> — Table row
                  <th> — Table header cell
              <tbody> — Table body (data rows)
                <tr> — Table row
                  <td> — Table data cell
          */}
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>SKU</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-message">
                  No products found. Add one or adjust your search.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>
                    <span className="category-badge">{product.category}</span>
                  </td>
                  <td>${product.price?.toFixed(2)}</td>
                  <td><code>{product.sku}</code></td>
                  <td className="action-buttons">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEdit(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(product.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Products;
