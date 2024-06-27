import {
    defineConfig,
    minimal2023Preset as preset,
} from '@vite-pwa/assets-generator/config'

/** Defines the app's icon */
export default defineConfig({
    headLinkOptions: {
        preset: '2023',
    },
    preset,
    images: ["./public/favicon-gear.png"],
})
