import { supabase } from "@/supabase";
import { useNavigate } from "@solidjs/router";
import { ParentProps, Show, createEffect, createSignal } from "solid-js";

import "./AuthGuard.css";

/**
 * Component that verifies a session is active before rendering its children.
 * @param props Parent props with the `children` components.
 * @returns The rendered `children` if logged in; Redirects to `'/login'` otherwise.
 */
export function AuthGuard(props: ParentProps) {
    const [hasSession, setSession] = createSignal(false);
    const navigate = useNavigate();
    const redirectDelay = 1500;

    createEffect(() => {
        supabase.auth.getSession().then(({ error, data }) => {
            const session = data?.session;
            const requiresLogin = !session || !!error;

            if (requiresLogin) {
                setSession(false);
                setTimeout(
                    () => navigate("/login", { replace: true }),
                    redirectDelay
                );
            } else {
                setSession(true);
            }
        });
    });

    return (
        <Show when={hasSession()}
            children={props.children}
            fallback={(
                <div class="redirect">
                    <p class="subtitle">Redirigiendo al inicio de sesión...</p>
                </div>
            )}
        />
    );
}