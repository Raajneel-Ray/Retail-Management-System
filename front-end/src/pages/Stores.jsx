// ============================================================
// Stores.jsx — Store Management Page
// ============================================================
//
// FEATURES:
//   1. Add a new store (name + address)
//   2. Validate if a store exists by ID
//
// BACKEND ENDPOINTS:
//   POST /store                    → Add store
//   GET  /store/validate/{storeId} → Check if store exists
//
// LEARNING FOCUS:
//   - Form submission with controlled components
//   - Conditional rendering for validation results
//   - Separate sections/cards for different features
// ============================================================

import { useState } from 'react';
import { addStore, validateStore } from '../api/api';
import Toast from '../components/Toast';
import './Stores.css';

function Stores() {
  // ---------- STATE ----------

  // Add Store form
  const [formData, setFormData] = useState({ name: '', address: '' });

  // Validate Store section
  const [validateId, setValidateId] = useState('');
  const [validationResult, setValidationResult] = useState(null); // null, true, or false

  // Toast notification
  const [toast, setToast] = useState(null);

  // ---------- ADD STORE ----------

  async function handleAddStore(e) {
    e.preventDefault(); // Prevent page reload

    try {
      const response = await addStore({
        name: formData.name.trim(),
        address: formData.address.trim(),
      });

      if (response.message && response.message.includes('successfully')) {
        setToast({ message: response.message, type: 'success' });
        setFormData({ name: '', address: '' }); // Reset form
      } else {
        setToast({ message: response.message || 'Something went wrong', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to add store', type: 'error' });
    }
  }

  // ---------- VALIDATE STORE ----------

  async function handleValidate() {
    if (!validateId.trim()) {
      setToast({ message: 'Please enter a store ID', type: 'error' });
      return;
    }

    try {
      // This API returns a plain boolean (true/false)
      const result = await validateStore(validateId.trim());
      setValidationResult(result);
    } catch (error) {
      setToast({ message: 'Validation failed', type: 'error' });
    }
  }

  // ---------- RENDER ----------

  return (
    <div className="stores-page">
      <h1>🏪 Store Management</h1>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="stores-grid">
        {/* ===== ADD STORE CARD ===== */}
        <div className="store-card">
          <h2>Add New Store</h2>
          <p className="card-description">Register a new retail store location.</p>

          <form onSubmit={handleAddStore}>
            <div className="form-group">
              <label htmlFor="store-name">Store Name</label>
              <input
                id="store-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Tech Store Downtown"
              />
            </div>

            <div className="form-group">
              <label htmlFor="store-address">Store Address</label>
              <input
                id="store-address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                placeholder="e.g., 123 Main Street, City, State"
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Add Store
            </button>
          </form>
        </div>

        {/* ===== VALIDATE STORE CARD ===== */}
        <div className="store-card">
          <h2>Validate Store</h2>
          <p className="card-description">Check if a store exists by its ID.</p>

          <div className="form-group">
            <label htmlFor="validate-id">Store ID</label>
            <input
              id="validate-id"
              type="number"
              min="1"
              value={validateId}
              onChange={(e) => {
                setValidateId(e.target.value);
                setValidationResult(null); // Reset result when ID changes
              }}
              placeholder="e.g., 1"
            />
          </div>

          <button className="btn btn-primary" onClick={handleValidate}>
            Validate
          </button>

          {/* ============================================================
              CONDITIONAL RENDERING: Show result only after validation
              ============================================================
              validationResult is initially null (no check done yet).
              After checking, it becomes true or false.

              We use a TERNARY OPERATOR: condition ? ifTrue : ifFalse
              This is JavaScript's inline if/else.
              ============================================================ */}
          {validationResult !== null && (
            <div className={`validation-result ${validationResult ? 'valid' : 'invalid'}`}>
              {validationResult ? (
                <span>✅ Store ID {validateId} exists!</span>
              ) : (
                <span>❌ Store ID {validateId} not found.</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Stores;
