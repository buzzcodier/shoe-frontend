import React from "react";
import ReactDOM from "react-dom/client";
import { useRegisterSW } from "virtual:pwa-register/react";
import App from "./App";
import "./index.css";

function PWAUpdater() {
  // Destructure with underscore-prefixed names to satisfy lint rules
  const {
    needRefresh: _needRefresh,
    updateServiceWorker: _updateServiceWorker,
  } = useRegisterSW({ immediate: true });

  return null;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PWAUpdater />
    <App />
  </React.StrictMode>
);