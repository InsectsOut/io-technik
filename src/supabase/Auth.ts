import { createClient } from "@supabase/supabase-js";

const { IO_SUPABASE_KEY, IO_SUPABASE_URL } = import.meta.env;

/** Supabase client instance - used to interact with the Database and Auth */
export const supabase = createClient(IO_SUPABASE_URL, IO_SUPABASE_KEY, {
    auth: { autoRefreshToken: true, persistSession: true }
});