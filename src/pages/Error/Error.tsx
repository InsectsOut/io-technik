import { useNavigate } from "@solidjs/router";
import css from "./Error.module.css";

export function Error() {
    const navigate = useNavigate();
    const goHome = () =>navigate("/home");
    return (
        <div class={css.container}>
            <h1 class={css.error}>Error 🚧</h1>
            <h2 class={css.error}>Regresar al inicio</h2>
            <button
                class="button is-link navbar-item"
                onClick={goHome}
            >
                Inicio 🏠
            </button>
        </div>
    );
}