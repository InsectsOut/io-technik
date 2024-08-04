import css from "./Loading.module.css";

export function Loading() {
    return (
        <div class={css.container}>
            <h1 class={css.loading}>Cargando...</h1>
        </div>
    );
}