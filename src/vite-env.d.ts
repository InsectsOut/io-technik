/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/solid" />

interface ImportMetaEnv {
    /** Supabase project ID for the **Insects Out** database  */
    readonly IO_SUPABASE_PROJECT: string;
    /** Supabase URL for the **Insects Out** database. */
    readonly IO_SUPABASE_URL: string;
    /** Supabase key for the **Insects Out** database.  */
    readonly IO_SUPABASE_KEY: string;
    /** Flat to disable the service worker caching */
    readonly IO_DISABLE_SW: boolean;
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}