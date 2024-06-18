import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
// import basicSsl from '@vitejs/plugin-basic-ssl'
import solid from 'vite-plugin-solid'

// https://vitejs.dev/config/
export default defineConfig({
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