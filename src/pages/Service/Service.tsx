import { createSignal, Match, Show, Suspense, Switch } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";

import { getServiceByFolio } from "./Service.query";
import { Loading } from "@/components/Loading";
import { Tables } from "@/supabase";

import { getLocalTime } from "@/utils/Date";
import { classNames } from "@/utils";
import { Error, Pages } from "..";

import { createQuery } from "@tanstack/solid-query";
import { match } from "ts-pattern";

import css from "./Service.module.css";
import { ServiceReport } from "./components";
import { ContactDetails } from "./components/ContactDetails";

type Tabs = "detalles" | "reporte" | "contacto";

export function Service() {
    const { folio } = useParams();
    const navigate = useNavigate();
    const goHome = () => navigate(Pages.Home);

    const [view, setView] = createSignal<Tabs>("detalles");
    const isContact = () => view() === "contacto";
    const isReport = () => view() === "reporte";
    const isInfo = () => view() === "detalles";

    const onReportSubmit = () => {
        window.setTimeout(() => servicio
            .refetch()
            .then(() => {
                setView("detalles");
                setView("reporte");
            }), 1000);
    };

    const getClientName = (cliente: Tables<"Clientes">) => {
        const { nombre, apellidos } = cliente;
        return `${nombre} ${apellidos}`;
    }

    const servicio = createQuery(() => ({
        queryKey: [`service/${folio}`],
        queryFn: () => getServiceByFolio(folio),
        staleTime: 1000 * 60 * 5,
        throwOnError: false
    }));

    const fechaServicio = () => servicio.data
        ? new Date(`${servicio.data?.fecha_servicio}T${servicio.data?.horario_servicio}`)
        : undefined;

    return (
        <Suspense fallback={<Loading />}>
            <nav class="panel is-shadowless">
                <p class={classNames("panel-heading io-heading", css.io_heading)}>
                    Datos del Servicio
                </p>

                <p class="panel-tabs is-justify-content-start">
                    <a class={classNames(["is-active", isInfo()])}
                        onClick={() => setView("detalles")}
                    >
                        Detalles
                    </a>
                    <a class={classNames(["is-active", isContact()])}
                        onClick={() => setView("contacto")}
                    >
                        Contacto
                    </a>
                    <a class={classNames(["is-active", isReport()])}
                        onClick={() => setView("reporte")}
                    >
                        Reporte
                    </a>
                </p>

                <Switch>
                    <Match when={servicio.error}>
                        <Error title="Error cargando el servicio 🚧" subtitle=" " />
                    </Match>

                    <Match when={servicio.data && isInfo()}>
                        <form>
                            <label class="label">Datos del Cliente</label>
                            <div class={classNames("field is-grouped is-flex-direction-column", css.io_field)}>
                                <p class="control has-icons-left">
                                    <input disabled class="input" type="text" value={`Folio: ${servicio.data?.folio}`} />
                                    <span class="icon is-medium is-left">
                                        <i class="fas fa-hashtag" />
                                    </span>
                                </p>
                                <p class="control has-icons-left">
                                    <input disabled class="input" value={getClientName(servicio.data?.Clientes!)} />
                                    <span class="icon is-small is-left">
                                        <i class="fas fa-user" />
                                    </span>
                                </p>
                            </div>

                            <div class={classNames("field is-grouped is-flex-direction-column", css.io_field)}>
                                <label class="label">Fecha de Servicio</label>
                                <p class="control has-icons-left">
                                    <input disabled class="input" type="text" value={servicio.data?.fecha_servicio ?? "No asignada"} />
                                    <span class="icon is-medium is-left">
                                        <i class="fas fa-calendar-days" />
                                    </span>
                                </p>
                                <label class="label">Hora de Servicio</label>
                                <p class="control has-icons-left">
                                    <input disabled class="input" value={getLocalTime(fechaServicio()) || "No asignada"} />
                                    <span class="icon is-small is-left">
                                        <i class="fas fa-clock" />
                                    </span>
                                </p>
                            </div>

                            <div class={classNames("field is-grouped is-flex-direction-column", css.io_field)}>
                                <label class="label">Frecuencia del Servicio</label>
                                <p class="control has-icons-left">
                                    <input disabled class="input" type="text" value={servicio.data?.frecuencia_recomendada || "No asignada"} />
                                    <span class="icon is-medium is-left">
                                        <i class="fas fa-clock-rotate-left" />
                                    </span>
                                </p>
                                <label class="label">Tipo de Servicio</label>
                                <p class="control has-icons-left">
                                    <input disabled class="input" value={servicio.data?.tipo_servicio || "Sin tipo"} />
                                    <span class="icon is-small is-left">
                                        <i class="fas fa-warehouse" />
                                    </span>
                                </p>
                            </div>

                            <div class={classNames("field is-grouped is-flex-direction-column", css.io_field)}>
                                <label class="label">Tipo de Folio</label>
                                <p class="control has-icons-left">
                                    <input disabled class="input" type="text" value={servicio.data?.tipo_folio || "Sin tipo"} />
                                    <span class="icon is-medium is-left">
                                        <i class="fas fa-file-pen" />
                                    </span>
                                </p>
                                <label class="label">Estado del Servicio</label>
                                <p class="control has-icons-left">
                                    <input disabled class="input" value={match(servicio.data)
                                        .with({ realizado: true }, () => "Realizado")
                                        .with({ cancelado: true }, () => "Cancelado")
                                        .otherwise(() => "Pendiente")} />
                                    <span class="icon is-small is-left">
                                        <i class="fas fa-circle-question" />
                                    </span>
                                </p>
                            </div>
                        </form>
                    </Match>

                    <Match when={servicio.data && isContact()}>
                        <ContactDetails
                            responsable={servicio.data?.Responsables!}
                            direccion={servicio.data?.Direcciones!}
                            ubicacion={servicio.data?.ubicacion!}
                        />
                    </Match>

                    <Match when={servicio.data && isReport()}>
                        <ServiceReport service={servicio.data ?? undefined} onReportSubmit={onReportSubmit} />
                    </Match>
                </Switch>

                <Show when={!isReport()}>
                    <div class="panel-block is-justify-content-center">
                        <button type="button" class="button is-link is-outlined is-half" onClick={goHome}>
                            Regresar a servicios
                        </button>
                    </div>
                </Show>
            </nav>
        </Suspense>
    );
}