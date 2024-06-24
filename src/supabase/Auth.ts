import { Session, createClient } from "@supabase/supabase-js";
import { createSignal } from "solid-js";

const { IO_SUPABASE_KEY, IO_SUPABASE_URL } = import.meta.env;

/** Supabase client instance - used to interact with the Database and Auth */
export const supabase = createClient(IO_SUPABASE_URL, IO_SUPABASE_KEY, {
    auth: { autoRefreshToken: true, persistSession: true }
});

/**
 * Getter/Setter for the current user session, if any
*/
export const [session, setSession] = createSignal<Session | null>(null);

/**
 * Updates the session when the auth state changes
 */
supabase.auth.onAuthStateChange((_, session) => {
    setSession(session);
});
