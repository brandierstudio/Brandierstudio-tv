// Redefine window.fetch to make it writable and configurable.
// This prevents uncaught exceptions (TypeError: Cannot set property fetch of #<Window> which has only a getter)
// when external runners or environment scripts attempt to override/mock window.fetch.
try {
  if (typeof window !== 'undefined' && window.fetch) {
    let currentFetch = window.fetch;
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      enumerable: true,
      get() {
        return currentFetch;
      },
      set(newFetch) {
        currentFetch = newFetch;
      }
    });
  }
} catch (e) {
  console.warn("Failed to configure window.fetch writability:", e);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
