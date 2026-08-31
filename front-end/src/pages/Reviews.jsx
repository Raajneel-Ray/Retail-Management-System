// ============================================================
// Reviews.jsx — Customer Reviews Page
// ============================================================
//
// FEATURES:
//   1. View all reviews from MongoDB
//   2. Filter reviews by store ID + product ID
//   3. Star rating display using Unicode characters
//
// BACKEND ENDPOINTS:
//   GET /reviews                        → All reviews
//   GET /reviews/{storeId}/{productId}  → Filtered reviews
//
// LEARNING FOCUS:
//   - Rendering dynamic star ratings with Array.from()
//   - Toggling between different data views
//   - Unicode characters in JSX
// ============================================================

import { useState, useEffect } from 'react';
import { getAllReviews, getReviewsByStoreAndProduct } from '../api/api';
import Toast from '../components/Toast';
import './Reviews.css';

function Reviews() {
  // ---------- STATE ----------

  const [allReviews, setAllReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [showFiltered, setShowFiltered] = useState(false);

  // Filter inputs
  const [filterStoreId, setFilterStoreId] = useState('');
  const [filterProductId, setFilterProductId] = useState('');

  const [toast, setToast] = useState(null);

  // ---------- LOAD ALL REVIEWS ON MOUNT ----------

  useEffect(() => {
    loadAllReviews();
  }, []);

  async function loadAllReviews() {
    try {
      const data = await getAllReviews();
      setAllReviews(data.reviews || []);
    } catch (error) {
      setToast({ message: 'Failed to load reviews', type: 'error' });
    }
  }

  // ---------- FILTER REVIEWS ----------

  async function handleFilterReviews() {
    if (!filterStoreId || !filterProductId) {
      setToast({ message: 'Enter both Store ID and Product ID', type: 'error' });
      return;
    }

    try {
      const data = await getReviewsByStoreAndProduct(filterStoreId, filterProductId);
      setFilteredReviews(data.reviews || []);
      setShowFiltered(true);
    } catch (error) {
      setToast({ message: 'Failed to filter reviews', type: 'error' });
    }
  }

  function handleShowAll() {
    setShowFiltered(false);
    setFilterStoreId('');
    setFilterProductId('');
  }

  // ---------- STAR RATING HELPER ----------

  // ============================================================
  // RENDERING STARS DYNAMICALLY
  // ============================================================
  // Array.from({ length: 5 }) creates an array with 5 empty slots: [undefined, undefined, ...]
  // We use .map() with the index (i) to decide if each star should be filled or empty.
  //
  //   ★ (U+2605) = Filled star  (when index < rating)
  //   ☆ (U+2606) = Empty star   (when index >= rating)
  //
  // For a rating of 3: ★★★☆☆
  // ============================================================
  function renderStars(rating) {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'star filled' : 'star empty'}>
        {i < rating ? '★' : '☆'}
      </span>
    ));
  }

  // ---------- RATING BADGE COLOR ----------

  function getRatingClass(rating) {
    if (rating >= 5) return 'rating-excellent';
    if (rating >= 4) return 'rating-good';
    if (rating >= 3) return 'rating-average';
    if (rating >= 2) return 'rating-poor';
    return 'rating-terrible';
  }

  // ---------- RENDER ----------

  // Decide which reviews to display
  const reviewsToShow = showFiltered ? filteredReviews : allReviews;

  return (
    <div className="reviews-page">
      <h1>⭐ Customer Reviews</h1>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* ===== FILTER BAR ===== */}
      <div className="reviews-filter">
        <input
          type="number"
          min="1"
          value={filterStoreId}
          onChange={(e) => setFilterStoreId(e.target.value)}
          placeholder="Store ID"
        />
        <input
          type="number"
          min="1"
          value={filterProductId}
          onChange={(e) => setFilterProductId(e.target.value)}
          placeholder="Product ID"
        />
        <button className="btn btn-primary" onClick={handleFilterReviews}>
          Search Reviews
        </button>
        {showFiltered && (
          <button className="btn btn-danger" onClick={handleShowAll}>
            Show All Reviews
          </button>
        )}
      </div>

      {/* ===== STATUS MESSAGE ===== */}
      <p className="reviews-count">
        {showFiltered
          ? `Showing ${filteredReviews.length} review(s) for Store #${filterStoreId}, Product #${filterProductId}`
          : `Showing all ${allReviews.length} reviews`}
      </p>

      {/* ===== REVIEW CARDS GRID ===== */}
      <div className="reviews-grid">
        {reviewsToShow.length === 0 ? (
          <p className="empty-message">No reviews found.</p>
        ) : (
          reviewsToShow.map((review, index) => (
            /*
              WHY index AS key?
              Ideally, we'd use a unique ID. But the filtered reviews
              don't have IDs (only rating, comment, customerName).
              Using the index is acceptable here since the list doesn't
              get reordered or modified.
            */
            <div key={review.id || index} className="review-card">
              {/* Customer info */}
              <div className="review-header">
                <span className="reviewer-name">
                  {review.customerName || `Customer #${review.customerId}`}
                </span>
                <span className={`rating-badge ${getRatingClass(review.rating)}`}>
                  {review.rating}/5
                </span>
              </div>

              {/* Star rating */}
              <div className="stars-row">
                {renderStars(review.rating)}
              </div>

              {/* Comment */}
              <p className="review-comment">"{review.comment}"</p>

              {/* Metadata (only for all-reviews view) */}
              {!showFiltered && (
                <div className="review-meta">
                  <span>Store #{review.storeId}</span>
                  <span>Product #{review.productId}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Reviews;
