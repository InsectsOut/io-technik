import { currentSession } from "@/supabase";
import { useLocation, useNavigate } from "@solidjs/router";
import { createEffect, ParentProps, Show } from "solid-js";

import "./AuthGuard.css";
import { Pages } from "@/pages";

/**
 * Component that verifies a session is active before rendering its children.
 * @param props Parent props with the `children` components.
 * @returns The rendered `children` if logged in; Redirects to `'/login'` otherwise.
 */
export function AuthGuard(props: ParentProps) {
    const navigate = useNavigate();
    const location = useLocation();

    createEffect(() => {
        if (!currentSession()) {
            // Store the current location before redirecting
            navigate(Pages.Login, {
                state: { from: location.pathname },
                replace: false
            });
        }
    });

    return (
        <Show when={currentSession()}
            children={props.children}
            fallback={(
                <div class="redirect">
                    <p class="subtitle">Iniciando sesión...</p>
                </div>
            )}
        />
    );
}