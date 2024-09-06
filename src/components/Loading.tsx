import css from "./Loading.module.css";

type LoadingProps = {
    message?: string;
};

export function Loading(props: LoadingProps) {
    return (
        <div class={css.container}>
            <h1 class={css.loading}>{props.message ?? "Cargando..."}</h1>
            <h2>Por favor espere un momento</h2>

            <progress class="progress is-medium is-info" max="100" />
        </div>
    );
}