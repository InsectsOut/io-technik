import { defineConfig } from '@vite-pwa/assets-generator/config'

/** Defines the app's icon */
export default defineConfig({
    headLinkOptions: {
        preset: 'default',
    },
    preset: "minimal",
    images: ["./public/favicon-gear.svg"],
})
