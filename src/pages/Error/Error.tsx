import { useNavigate } from "@solidjs/router";
import css from "./Error.module.css";

export function Error() {
    const goto = useNavigate();
    return (
        <div class={css.container}>
            <h1 class={css.error}>Error 🚧</h1>
            <h2 class={css.error}>Regresar al inicio</h2>
            <button
                onClick={() => goto("/")}
                class="button is-link navbar-item"
            >
                Inicio 🏠
            </button>
        </div>
    );
}