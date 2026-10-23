import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png"],
      manifest: {
        name: "Shoe Shop Manager",
        short_name: "Shop",
        description: "Point of sale and shop management",
        theme_color: "#059669",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
workbox: {
  globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
  navigateFallback: "index.html",
  navigateFallbackDenylist: [/^\/api\//],
  cleanupOutdatedCaches: true,
  skipWaiting: true,
  clientsClaim: true,
  offlineGoogleAnalytics: false,
  runtimeCaching: [
    {
      urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
      handler: "NetworkOnly",
    },
    {
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 3,
      },
    },
  ],
},
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
  },
});