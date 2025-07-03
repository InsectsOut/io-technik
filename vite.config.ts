import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vite"
import { resolve } from "path";

import purgeCss from "vite-plugin-purgecss-updated-v5";
import devtools from "solid-devtools/vite"
import solid from "vite-plugin-solid"

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: "IO_",

  resolve: {
    alias: [
      { find: "@", replacement: resolve(__dirname, "./src") },
    ]
  },

  worker: {
    format: "es"
  },

  plugins: [
    solid(),
    devtools({ autoname: true }),
    purgeCss({ variables: true, rejectedCss: true }),
    VitePWA({
      strategies: "generateSW",
      registerType: "prompt",
      injectRegister: false,

      manifest: {
        name: "io-technik",
        short_name: "io-technik",
        description: "Registra tus servicios de Insects Out",
        background_color: "#434784",
        theme_color: "transparent",
        start_url: "/login",
        lang: "es",
        id: "/",

        screenshots: [
          {
            label: "Desktop layout io-technik",
            src: "screenshot-pwa-pc.png",
            form_factor: "wide",
            type: "image/png",
            sizes: "876x664"
          },
          {
            label: "Mobile layout io-technik",
            src: "screenshot-pwa-mobile.png",
            form_factor: "narrow",
            type: "image/png",
            sizes: "970x704"
          }
        ],

        icons: [
          {
            src: "/pwa-192x192.png",
            type: "image/png",
            sizes: "192x192",
            purpose: "any"
          },
          {
            src: "/pwa-512x512.png",
            type: "image/png",
            sizes: "512x512",
            purpose: "any"
          },
          {
            src: "/favicon-gear.svg",
            type: "image/svg+xml",
            sizes: "any",
            purpose: "any"
          }
        ]
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },

      devOptions: {
        enabled: true,
        navigateFallback: "index.html",
        suppressWarnings: true,
        type: "module",
      },
    })
  ],
})