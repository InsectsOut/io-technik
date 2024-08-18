import { useNavigate } from "@solidjs/router";
import { Pages } from "..";

import css from "./Error.module.css";
import { Show } from "solid-js";

type ErrorProps = {
    title?: string;
    subtitle?: string;
    hide_link?: boolean;
    link_txt?: string;
    link?: Pages;
};

export function Error(props: ErrorProps) {
    const navigate = useNavigate();
    const navigateTo = () => navigate(props.link ?? Pages.Home);

    const title = props.title ?? "Error 🚧";
    const subtitle = props.subtitle ?? "Regresar al inicio";

    return (
        <div class={css.container}>
            <h1 class={css.error}>{title}</h1>
            <h2 class="subtitle">{subtitle}</h2>

            <Show when={props.hide_link !== false}>
                <button
                    type="button"
                    class="button is-link"
                    onClick={navigateTo}
                >
                    <strong class={css.strong}>
                        {props.link_txt || "Inicio"}
                    </strong>
                </button>
            </Show>
        </div>
    );
}