import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import { resolve } from "path";

import purgeCss from "vite-plugin-purgecss-updated-v5";
import devtools from 'solid-devtools/vite'
import solid from 'vite-plugin-solid'

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

      pwaAssets: {
        htmlPreset: "2023",
        disabled: false,
        config: true,
      },

      manifest: {
        name: 'io-technik',
        short_name: 'io-technik',
        description: 'Registra tus servicios de Insects Out',
        background_color: "#69748c",
        theme_color: '#69748c',
        start_url: "/login",
        lang: "es",
        id: "/",
        
        screenshots: [
          {
            label: "Login page for io-technik",
            src: "/public/screenshot-pwa.png",
            form_factor: "wide",
            type: "image/png",
            sizes: "444x763"
          },
          {
            label: "Login page for io-technik",
            src: "/public/screenshot-pwa.png",
            form_factor: "narrow",
            type: "image/png",
            sizes: "444x763"
          }
        ],

        icons: [
          {
            src: "/public/icon-192x192.png",
            type: "image/png",
            sizes: "192x192",
          },
          {
            src: "/public/icon-512x512.png",
            type: "image/png",
            sizes: "512x512",
          },
          {
            src: "/public/favicon-gear.svg",
            type: "image/svg+xml",
            sizes: "any",
          }
        ]
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },

      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module',
      },
    })
  ],
})