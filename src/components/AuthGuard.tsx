import { currentSession } from "@/supabase";
import { Navigate } from "@solidjs/router";
import { ParentProps, Show } from "solid-js";

import "./AuthGuard.css";

/**
 * Component that verifies a session is active before rendering its children.
 * @param props Parent props with the `children` components.
 * @returns The rendered `children` if logged in; Redirects to `'/login'` otherwise.
 */
export function AuthGuard(props: ParentProps) {
    return (
        <Show when={currentSession()}
            children={props.children}
            fallback={(
                <div class="redirect">
                    <Navigate href="/login" />
                    <p class="subtitle">Iniciando sesión...</p>
                </div>
            )}
        />
    );
}