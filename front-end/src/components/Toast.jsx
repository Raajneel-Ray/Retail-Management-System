// ============================================================
// Toast.jsx — Notification Component
// ============================================================
//
// WHAT IS A TOAST?
// A toast is a small popup notification that appears briefly
// (like toast popping up from a toaster!) to show success or
// error messages, then automatically disappears.
//
// REACT CONCEPT: PROPS
// =====================
// Props (short for "properties") are how parent components pass
// data to child components. Think of props like function arguments.
//
// This component receives 3 props:
//   - message: The text to display
//   - type: 'success' or 'error' (determines the color)
//   - onClose: A function the parent provides to dismiss the toast
// ============================================================

import { useEffect } from 'react';
import './Toast.css';

function Toast({ message, type, onClose }) {
  // ============================================================
  // REACT HOOK: useEffect
  // =====================
  // useEffect runs "side effects" — things that happen OUTSIDE of
  // rendering (like timers, API calls, DOM manipulation).
  //
  // Syntax: useEffect(effectFunction, dependencyArray)
  //
  // The DEPENDENCY ARRAY controls WHEN the effect runs:
  //   []         → Run ONCE after first render (mount)
  //   [a, b]     → Run when 'a' or 'b' changes
  //   (omitted)  → Run after EVERY render (usually bad!)
  //
  // CLEANUP FUNCTION:
  // If the effect returns a function, React calls it when:
  //   1. The component is removed from the page (unmount)
  //   2. Before re-running the effect (if dependencies changed)
  // This prevents memory leaks (e.g., timers still running after
  // the component is gone).
  // ============================================================
  useEffect(() => {
    // Set a timer to auto-close after 3 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    // CLEANUP: If the component unmounts before 3 seconds,
    // cancel the timer to prevent calling onClose on a
    // component that no longer exists.
    return () => clearTimeout(timer);
  }, [onClose]); // Re-run if onClose function changes

  return (
    <div className={`toast toast-${type}`}>
      {/*
        TEMPLATE LITERAL in className:
        `toast toast-${type}` creates a string like "toast toast-success"
        or "toast toast-error". This lets us apply different CSS styles
        based on the type prop.
      */}
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}

export default Toast;
