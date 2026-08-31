// ============================================================
// Dashboard.jsx — Home Page
// ============================================================
//
// REACT CONCEPT: FUNCTIONAL COMPONENTS
// =====================================
// A React component is just a JavaScript function that returns JSX.
// This is the simplest type — no state, no effects, just UI.
// It's sometimes called a "presentational" or "dumb" component
// because it only displays things, no complex logic.
//
// HTML CONCEPT: SEMANTIC ELEMENTS
// ================================
// <section>, <h1>, <h2>, <p> are semantic HTML elements.
// They describe the PURPOSE of the content, not just how it looks.
// This helps with accessibility (screen readers) and SEO.
// ============================================================

import { Link } from 'react-router-dom';
import './Dashboard.css';

// ============================================================
// WHAT IS Link?
// Link is React Router's replacement for <a href="...">.
// Unlike <a>, Link does NOT reload the page — it updates the URL
// and React renders the new component instantly. This is what
// makes Single Page Apps feel fast.
// ============================================================

function Dashboard() {
  // Define the navigation cards as data.
  // This is a common React pattern: define data as an array of objects,
  // then use .map() to render each item. This avoids repetitive JSX.
  const cards = [
    {
      emoji: '📦',
      title: 'Products',
      description: 'Manage your product catalog — add, edit, delete, and search products.',
      path: '/products',
      color: '#0f3460',
    },
    {
      emoji: '🏪',
      title: 'Stores',
      description: 'Add new store locations and validate existing stores.',
      path: '/stores',
      color: '#e94560',
    },
    {
      emoji: '📋',
      title: 'Inventory',
      description: 'Track stock levels per store — search, filter, and manage inventory.',
      path: '/inventory',
      color: '#16213e',
    },
    {
      emoji: '🛒',
      title: 'Place Order',
      description: 'Create customer orders — browse products, add to cart, and checkout.',
      path: '/place-order',
      color: '#533483',
    },
    {
      emoji: '⭐',
      title: 'Reviews',
      description: 'View customer feedback and ratings from all stores.',
      path: '/reviews',
      color: '#0b8457',
    },
  ];

  return (
    <div className="dashboard">
      {/* Hero Section — the big welcome area at the top */}
      <section className="hero">
        <h1>Retail Management System</h1>
        <p>
          A full-stack application built with React and Spring Boot. Manage products,
          stores, inventory, orders, and customer reviews all in one place.
        </p>
      </section>

      {/* Navigation Cards Grid */}
      <section className="cards-grid">
        {/*
          ARRAY METHOD: .map()
          ====================
          .map() transforms each item in an array into something else.
          Here, we transform each card DATA object into a JSX element.

          WHY DO WE NEED key={...}?
          React uses the 'key' prop to efficiently track which items
          changed, were added, or removed. Without it, React would
          re-render ALL items even if only one changed. Always use
          a unique value (like the path) as the key.
        */}
        {cards.map((card) => (
          <Link to={card.path} key={card.path} className="dashboard-card">
            <div className="card-emoji">{card.emoji}</div>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <span className="card-arrow">→</span>
          </Link>
        ))}
      </section>
    </div>
  );
}

export default Dashboard;
