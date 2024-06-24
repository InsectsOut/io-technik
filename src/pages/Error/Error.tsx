import { useNavigate } from "@solidjs/router";
import css from "./Error.module.css";

export function Error() {
    const navigate = useNavigate();
    const goHome = () => navigate("/home");

    return (
        <div class={css.container}>
            <h1 class={css.error}>Error 🚧</h1>
            <h2 class="subtitle">Regresar al inicio</h2>
            <button
                type="button"
                class="button is-link"
                onClick={goHome}
            >
                <strong class={css.strong}>
                    Inicio
                </strong>
            </button>
        </div>
    );
}