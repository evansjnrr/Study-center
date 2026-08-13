import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "Personal Study Center",
        short_name: "Study Center",
        description:
          "A local-first visual study room for Cambridge A-Level Physics, Economics and Computer Science.",
        theme_color: "#070709",
        background_color: "#070709",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        icons: [
          { src: "icon.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
          { src: "icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
          { src: "icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
      workbox: {
        // Precache the whole app shell + fonts + KaTeX fonts so it runs offline.
        globPatterns: ["**/*.{js,css,html,svg,woff,woff2,ttf,eot}"],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: Number(process.env.PORT) || 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          katex: ["katex"],
          vendor: ["zustand", "idb"],
        },
      },
    },
  },
});
