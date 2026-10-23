import React from "react";
import ReactDOM from "react-dom/client";
import { useRegisterSW } from "virtual:pwa-register/react";
import App from "./App";
import "./index.css";

function PWAUpdater() {
  // Register the service worker — handles install, update, offline cache
  useRegisterSW({ immediate: true });
  return null;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PWAUpdater />
    <App />
  </React.StrictMode>
);