// ============================================================
// main.jsx — React Entry Point
// ============================================================
// This is the FIRST JavaScript file that runs when your app loads.
// It connects React to the HTML page.
// ============================================================

// IMPORTS — JavaScript Concept
// 'import' lets you bring in code from other files or packages.
// React uses a component-based architecture where you build
// small pieces (components) and combine them together.
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

// ============================================================
// WHAT IS BrowserRouter?
// ============================================================
// In a traditional website, clicking a link loads a NEW HTML page
// from the server. In React (a Single Page App), we DON'T want that.
//
// BrowserRouter intercepts link clicks and updates the URL WITHOUT
// reloading the page. It then tells React which component to show
// based on the current URL. This makes navigation feel instant.
//
// We wrap the entire <App /> inside <BrowserRouter> so that
// every component in our app can use routing features.
// ============================================================

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
