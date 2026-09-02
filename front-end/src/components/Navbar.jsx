// ============================================================
// Navbar.jsx — Navigation Bar Component
// ============================================================
//
// WHAT IS A COMPONENT?
// A component is a reusable piece of UI. Think of it like a LEGO block.
// This Navbar component is used on EVERY page — we write it once and
// React renders it everywhere.
//
// WHAT IS JSX?
// JSX looks like HTML but it's actually JavaScript. React transforms
// JSX into regular JavaScript function calls that create DOM elements.
// Key differences from HTML:
//   - Use className instead of class (class is a reserved word in JS)
//   - Use camelCase for attributes (onClick, not onclick)
//   - You can embed JavaScript expressions inside {curly braces}
// ============================================================

import { NavLink } from 'react-router-dom';
import './Navbar.css';

// ============================================================
// WHAT IS NavLink?
// NavLink is like an <a> tag, but smarter:
//   1. It doesn't reload the page (stays in the Single Page App)
//   2. It automatically adds an "active" class when the current URL
//      matches its 'to' prop — perfect for highlighting the current page
// ============================================================

function Navbar() {
  return (
    // <nav> is a SEMANTIC HTML element — it tells browsers & screen readers
    // "this section contains navigation links." Always use semantic HTML
    // instead of generic <div> when possible.
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/" className="brand-link">
          🛒 RetailMS
        </NavLink>
      </div>

      {/* The navigation links */}
      <ul className="navbar-links">
        {/*
          NavLink's className can be a FUNCTION that receives { isActive }.
          This lets us conditionally add the "active" class.
          This is called a "render prop" pattern.
        */}
        <li>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/products"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Products
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/stores"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Stores
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/inventory"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Inventory
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/place-order"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Place Order
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/orders"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Orders
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/reviews"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Reviews
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

// 'export default' means this is the main thing this file exports.
// Other files can import it with: import Navbar from './Navbar'
export default Navbar;
