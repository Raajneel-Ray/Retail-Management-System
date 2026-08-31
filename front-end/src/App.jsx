// ============================================================
// App.jsx — The Root Component
// ============================================================
//
// REACT ROUTER CONCEPT: Routes
// =============================
// React Router maps URL paths to React components.
// When the URL changes, React Router renders the matching component.
//
// <Routes>  — Container for all route definitions
// <Route>   — Maps a 'path' (URL) to an 'element' (component)
//
// Example: <Route path="/products" element={<Products />} />
//   → When URL is "/products", render the <Products /> component
//
// The 'path="/"' route is the homepage (Dashboard).
// ============================================================

import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Stores from './pages/Stores';
import Inventory from './pages/Inventory';
import PlaceOrder from './pages/PlaceOrder';
import Reviews from './pages/Reviews';
import './App.css';

function App() {
  return (
    // A React component must return a SINGLE root element.
    // We use a <div> to wrap everything together.
    <div className="app">
      {/* Navbar appears on EVERY page — it's outside <Routes> */}
      <Navbar />

      {/* Main content area where page components render */}
      <main className="main-content">
        <Routes>
          {/*
            Each Route defines: "when the URL matches this path,
            show this component."

            The 'path="/"' is the root/home page.
          */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/reviews" element={<Reviews />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
