/**
 * Portal Entry Point
 *
 * Main entry for frs-wp-users profile management portal
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import './index.css';

// Get root element
const rootElement = document.getElementById('frs-users-portal-root');

if (!rootElement) {
  console.error('Portal root element not found. Make sure there is a div with id="frs-users-portal-root" in your HTML.');
} else {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}
