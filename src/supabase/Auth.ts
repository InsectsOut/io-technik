import { Session, createClient } from "@supabase/supabase-js";
import { createSignal } from "solid-js";
import { Database as IO_Schema } from "./Database";

const { IO_SUPABASE_KEY, IO_SUPABASE_URL } = import.meta.env;

/** Supabase client instance - used to interact with the Database and Auth */
const supabase = createClient<IO_Schema>(IO_SUPABASE_URL, IO_SUPABASE_KEY);

/**
 * Updates the session when the auth state changes
*/
supabase.auth.onAuthStateChange((_, session) => {
    setSession(session);
});

/**
 * Getter/Setter for the current user session, if any
*/
export const [currentSession, setSession] = createSignal<Session | null>(null);

/**
 * Exports the **Insects Out** database for CRUD operations
 */
export const Database = supabase.schema("public");

/**
 * Singleton that exports most common auth operations.
 * Wraps the `supabase.auth` helpers and the current session.
 */
export const Auth = Object.freeze({
    /**
     * Log in an existing user with an email and password.
     * 
     * Will not distinguish between the not existing account
     * or that the email and password combination is wrong.
     * 
     * @param email The user's email address
     * @param password The user's password
     * @returns A `promise` with the login operation's result
    */
    signIn(email: string, password: string) {
        if (!email) {
            return Promise.reject("No email argument");
        }

        if (!password) {
            return Promise.reject("No password argument");
        }

        return supabase.auth.signInWithPassword({ email, password });
    },

    /**
     * Removes the logged in user from the browser session and log them out
     * removing all items from localstorage and then trigger a **"SIGNED_OUT"** event.
     * @returns A `promise` with the operation's `AuthError` if any.
     */
    signOut() {
        return supabase.auth.signOut();
    },

    /**
     * Gets the current user details if there is an existing session. This method performs a network request to the Supabase Auth server, so the returned value is authentic and can be used to base authorization rules on.
     * @returns A `promise` with the current **User**, `null` otherwise.
     */
    async getUser() {
        const { user } = await this.getSession() || {};
        return user || null;
    },

    /**
     * Returns the current session, refreshing if necessary.
     * The session returned can be null if the session is not detected
     * which can happen in the event a user is not signed-in or has logged out.
     * @returns A `promise` with the current **Session**, if any.
     */
    async getSession() {
        const current = currentSession();
        if (current) {
            return current;
        }

        const { data } = await supabase.auth.getSession();
        return data
            ? setSession(data.session)
            : null;
    }
});
