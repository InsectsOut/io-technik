import { useNavigate } from "@solidjs/router";
import css from "./NotFound.module.css";

export function NotFound() {
    const navigate = useNavigate();
    const goHome = () => navigate("/home");

    return (
        <div class={css.container}>
            <h1 class={css.notFound}>404 🚫</h1>
            <h2 class="subtitle">Esta página no existe</h2>
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