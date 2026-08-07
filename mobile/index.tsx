// Polyfills for Node.js 18 compatibility
if (!Array.prototype.toReversed) {
  (Array.prototype as any).toReversed = function() {
    return [...this].reverse();
  };
}

import React from 'react';
import { registerRootComponent } from 'expo';
import { ErrorBoundary } from './ErrorBoundary';
import App from './App';

// Wrap App in ErrorBoundary to catch any update errors
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

registerRootComponent(AppWithErrorBoundary);
