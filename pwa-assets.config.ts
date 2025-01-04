import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

/** Defines the app's icon */
export default defineConfig({
    headLinkOptions: {
        preset: "2023",
    },
    preset: minimal2023Preset,
    images: ["./public/favicon-gear.svg"],
})
