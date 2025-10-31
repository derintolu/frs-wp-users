import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { ThemeProvider } from "@/components/theme-provider"

// Mount on FRS Users admin root element
const el = document.getElementById("frs-users-admin-root");

if (el) {
  // Get initial route from data attribute if provided
  const initialRoute = el.dataset.route || '/';

  // Update router location if initial route is provided
  if (initialRoute && initialRoute !== '/') {
    window.location.hash = initialRoute;
  }

  ReactDOM.createRoot(el).render(
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
    </ThemeProvider>,
  );
}
