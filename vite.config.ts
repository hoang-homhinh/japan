import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  build: { target: "es2022", chunkSizeWarningLimit: 2500 },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["icons/icon.svg", "icons/apple-touch-icon.png"],
      manifest: {
        name: "Đặt câu mỗi ngày – tiếng Nhật N5",
        short_name: "Đặt câu",
        description: "Học tiếng Nhật N5 mỗi ngày: từ vựng, kanji, ngữ pháp Minna Bài 1–25, trợ từ, luyện thi.",
        lang: "vi",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#FBF6EC",
        theme_color: "#1F3A5F",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
      workbox: {
        // cache toàn bộ asset để học offline
        globPatterns: ["**/*.{js,css,html,svg,png,ico,json,webmanifest}"],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        navigateFallback: "/index.html",
        runtimeCaching: [
          { urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i, handler: "StaleWhileRevalidate", options: { cacheName: "google-fonts-css" } },
          { urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i, handler: "CacheFirst", options: { cacheName: "google-fonts", expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } } },
        ],
      },
    }),
  ],
});
