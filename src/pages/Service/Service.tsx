import { useNavigate, useParams } from "@solidjs/router";
import { Pages } from "..";

import css from "./Service.module.css";
import { createQuery } from "@tanstack/solid-query";
import { fetchServiceById } from "./Service.query";

export function Service() {
    const params = useParams();
    const navigate = useNavigate();
    const goHome = () => navigate(Pages.Home);

    const query = createQuery(() => ({
        queryKey: [`service/${params.id}`],
        queryFn: () => fetchServiceById(params.id),
        staleTime: 1000 * 60 * 5,
        throwOnError: false
    }));

    return (
        <div class={css.container}>
            <h1 class={css.service}>Servicio de {query.data?.Clientes?.nombre}</h1>
            <h2 class="subtitle">N°{params.id}</h2>
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