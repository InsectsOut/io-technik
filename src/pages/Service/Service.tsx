import { useNavigate, useParams } from "@solidjs/router";
import { Pages } from "..";

import css from "./Service.module.css";
import { createQuery } from "@tanstack/solid-query";
import { fetchServiceById } from "./Service.query";
import { Show, Suspense } from "solid-js";
import { Loading } from "@/components/Loading";

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

    const ErrorLoading = () => (
        <>
            <div>Error cargando datos del servicio ❗</div>
            <div>{query.error?.message}</div>
        </>
    );

    return (
        <Suspense fallback={<Loading />}>
            <Show when={query.data} fallback={ErrorLoading()}>
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
            </Show>
        </Suspense>
    );
}