import { session } from "@/supabase";
import { useNavigate } from "@solidjs/router";
import { ParentProps, Show, createEffect } from "solid-js";

import "./AuthGuard.css";

/**
 * Component that verifies a session is active before rendering its children.
 * @param props Parent props with the `children` components.
 * @returns The rendered `children` if logged in; Redirects to `'/login'` otherwise.
 */
export function AuthGuard(props: ParentProps) {
    /** Time to wait before redirecting to login page */
    const redirectDelay = 1000;
    const navigate = useNavigate();
    
    createEffect(() => {
        if (session()) {
            return;
        }

        setTimeout(
            () => navigate("/login"),
            redirectDelay
        );
    });

    return (
        <Show when={session()}
            children={props.children}
            fallback={(
                <div class="redirect">
                    <p class="subtitle">Iniciando sesión...</p>
                </div>
            )}
        />
    );
}