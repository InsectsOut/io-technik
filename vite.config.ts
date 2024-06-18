import { resolve } from "path";
import { VitePWA } from 'vite-plugin-pwa';
import solid from 'vite-plugin-solid'
import { defineConfig } from 'vite'
// import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      { find: "@", replacement: resolve(__dirname, "./src") },
    ]
  },

  plugins: [solid(), VitePWA({
    registerType: 'autoUpdate',
    injectRegister: "script",

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'io-field-app',
      short_name: 'io-field-app',
      description: 'Aplicacion PWA de campo para Insects Out',
      theme_color: '#69748c',
      start_url: "/",
      lang: "es",
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
  })],
})