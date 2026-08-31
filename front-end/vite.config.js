// ============================================================
// vite.config.js — Vite Configuration File
// ============================================================
// WHAT IS VITE?
// Vite is a build tool that serves your code during development
// and bundles it for production. It's much faster than older tools
// like Webpack because it uses native ES modules in the browser.
// ============================================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Plugins extend Vite's capabilities.
  // The React plugin enables JSX transformation and Fast Refresh
  // (your changes appear instantly in the browser without losing state).
  plugins: [react()],

  server: {
    // The port your frontend runs on during development.
    // Access your app at: http://localhost:5173
    port: 5173,
  },
});
