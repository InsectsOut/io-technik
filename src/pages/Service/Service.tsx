import { useNavigate, useParams } from "@solidjs/router";
import { Pages } from "..";

import { createQuery } from "@tanstack/solid-query";
import { fetchServiceById } from "./Service.query";
import { createEffect, createSignal, Match, Suspense, Switch } from "solid-js";
import { Loading } from "@/components/Loading";
import { Tables } from "@/supabase";

import { classNames } from "@/utils";
import { getLocalTime } from "@/utils/Date";
import { match } from "ts-pattern";

import css from "./Service.module.css";

export function Service() {
    const params = useParams();
    const navigate = useNavigate();
    const goHome = () => navigate(Pages.Home);
    const [isView, setView] = createSignal(true);
    const isEdit = () => !isView();

    const getClientName = (cliente: Tables<"Clientes">) => {
        const { nombre, apellidos } = cliente;
        return `${nombre} ${apellidos}`;
    }

    const servicio = createQuery(() => ({
        queryKey: [`service/${params.id}`],
        queryFn: () => fetchServiceById(params.id),
        staleTime: 1000 * 60 * 5,
        throwOnError: false
    }));

    const fechaServicio = () => servicio.data
        ? new Date(`${servicio.data?.fecha_servicio}T${servicio.data?.horario_servicio}`)
        : undefined;

    const getDireccion = (direccion?: Tables<"Direcciones">) => {
        if (!direccion) {
            return "No hay una dirección registrada";
        }

        const { calle, ciudad, codigo_postal, colonia, numero_ext, estado } = direccion
        return `${calle} #${numero_ext}, ${colonia}. C.P. ${codigo_postal}, ${ciudad}, ${estado}`;
    };

    createEffect(() => servicio.data?.Direcciones)

    const ErrorLoading = () => (
        <>
            <div>Error cargando datos del servicio</div>
            <div>{servicio.error?.message}</div>
        </>
    );

    return (
        <Suspense fallback={<Loading />}>
            <nav class="panel is-shadowless">
                <p class={classNames("panel-heading", css['io-heading'])}>
                    Datos del Servicio
                </p>

                <p class="panel-tabs is-justify-content-start">
                    <a class={classNames(["is-active", isView()])}
                        onClick={() => setView(true)}
                    >
                        Detalles
                    </a>
                    <a class={classNames(["is-active", isEdit()])}
                        onClick={() => setView(false)}
                    >
                        Reporte de Servicio
                    </a>
                </p>

                <Switch>
                    <Match when={servicio.error}>
                        <ErrorLoading />
                    </Match>

                    <Match when={servicio.data && isView()}>
                        <form>
                            <label class="label">Datos del Cliente</label>
                            <div class="field is-grouped is-flex-direction-column">
                                <p class="control has-icons-left">
                                    <input disabled class="input" type="text" value={"Folio: " + servicio.data?.folio} />
                                    <span class="icon is-medium is-left">
                                        <i class="fas fa-hashtag"></i>
                                    </span>
                                </p>
                                <p class="control has-icons-left">
                                    <input disabled class="input" value={getClientName(servicio.data?.Clientes!)} />
                                    <span class="icon is-small is-left">
                                        <i class="fas fa-user"></i>
                                    </span>
                                </p>
                            </div>

                            <div class={classNames("field", css.full_height)}>
                                <label class="label">Dirección</label>
                                <p class="control has-icons-left">
                                    <textarea disabled={isView()} class="input" value={getDireccion(servicio.data?.Direcciones ?? undefined)} />
                                    <span class="icon is-medium is-left">
                                        <i class="fas fa-location-dot"></i>
                                    </span>
                                </p>
                            </div>

                            <div class="field is-grouped is-flex-direction-column">
                                <label class="label">Fecha de Servicio</label>
                                <p class="control has-icons-left">
                                    <input disabled={isView()} class="input" type="text" value={servicio.data?.fecha_servicio} />
                                    <span class="icon is-medium is-left">
                                        <i class="fas fa-calendar-days"></i>
                                    </span>
                                </p>
                                <label class="label">Hora de Servicio</label>
                                <p class="control has-icons-left">
                                    <input disabled={isView()} class="input" value={getLocalTime(fechaServicio())} />
                                    <span class="icon is-small is-left">
                                        <i class="fas fa-clock"></i>
                                    </span>
                                </p>
                            </div>

                            <div class="field is-grouped is-flex-direction-column">
                                <label class="label">Frecuencia del Servicio</label>
                                <p class="control has-icons-left">
                                    <input disabled={isView()} class="input" type="text" value={servicio.data?.frecuencia_recomendada || ""} />
                                    <span class="icon is-medium is-left">
                                        <i class="fas fa-clock-rotate-left"></i>
                                    </span>
                                </p>
                                <label class="label">Tipo de Servicio</label>
                                <p class="control has-icons-left">
                                    <input disabled={isView()} class="input" value={servicio.data?.tipo_servicio || ""} />
                                    <span class="icon is-small is-left">
                                        <i class="fas fa-warehouse"></i>
                                    </span>
                                </p>
                            </div>

                            <div class="field is-grouped is-flex-direction-column">
                                <label class="label">Tipo de Folio</label>
                                <p class="control has-icons-left">
                                    <input disabled={isView()} class="input" type="text" value={servicio.data?.tipo_folio || ""} />
                                    <span class="icon is-medium is-left">
                                        <i class="fas fa-file-pen"></i>
                                    </span>
                                </p>
                                <label class="label">Estado del Servicio</label>
                                <p class="control has-icons-left">
                                    <input disabled={isView()} class="input" value={match(servicio.data)
                                        .with({ realizado: true }, () => "Realizado")
                                        .with({ cancelado: true }, () => "Cancelado")
                                        .otherwise(() => "Pendiente")} />
                                    <span class="icon is-small is-left">
                                        <i class="fas fa-circle-question"></i>
                                    </span>
                                </p>
                            </div>
                        </form>
                    </Match>

                    <Match when={servicio.data && isEdit()}>
                        <h1 style={{ "text-align": "center", margin: "3rem", "font-size": "2.5rem" }}>WIP 👷‍♂️🚧</h1>
                    </Match>
                </Switch>

                <div class="panel-block is-justify-content-center">
                    <button type="button" class="button is-link is-outlined is-half" onClick={goHome}>
                        Regresar a servicios
                    </button>
                </div>
            </nav>
        </Suspense>
    );
}