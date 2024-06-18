import css from "./NotFound.module.css";

export function NotFound() {
    return (
        <div class={css.container}>
            <h1 class={css.notFound}>404</h1>
            <h2 class={css.notFound}>Esta página no existe</h2>
        </div>
    );
}