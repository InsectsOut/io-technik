import { A } from "@solidjs/router";
import css from "./Error.module.css";

export function Error() {
    return (
        <div class={css.container}>
            <h1 class={css.error}>Ha ocurrido un error</h1>
            <h2 class={css.error}>Regresar al Inicio</h2>
            <A href="/" class="has-text-link navbar-item">
                Inicio
            </A>
        </div>
    );
}