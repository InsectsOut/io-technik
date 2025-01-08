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
import { SuppliesDetails } from "./SuppliesDetails";

type Tabs = "detalles" | "reporte" | "contacto" | "supplies";

export function Service() {
    const { folio } = useParams();
    const navigate = useNavigate();
    const goHome = () => navigate(Pages.Home);

    const [view, setView] = createSignal<Tabs>("detalles");
    const isSupplies = () => view() === "supplies";
    const isContact = () => view() === "contacto";
    const isReport = () => view() === "reporte";
    const isInfo = () => view() === "detalles";

    /** Updates the service cache if requested by a child */
    document.addEventListener("UpdateService",
        () => servicio.refetch().then(() => {
            setView("detalles");
            setView("supplies");
        }));

    const onReportSubmit = () => window.setTimeout(
        () => servicio.refetch().then(() => {
            setView("detalles");
            setView("reporte");
        }), 1000);

    /** Sets the provided tab as the current view and scrolls to it */
    const setViewAndFocus = (el: HTMLElement, tab: Tabs) => {
        window.requestAnimationFrame(() => {
            el.scrollIntoView({ behavior: "smooth" });
            setView(tab);
        });
    }

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

    let detallesTab: Maybe<HTMLAnchorElement>;
    let contactosTab: Maybe<HTMLAnchorElement>;
    let suppliesTab: Maybe<HTMLAnchorElement>;
    let reporteTab: Maybe<HTMLAnchorElement>;

    return (
        <Suspense fallback={<Loading />}>
            <nav class="panel is-shadowless">
                <h1 class="title has-text-centered">
                    Servicio #{folio}
                </h1>

                <p class="panel-tabs is-justify-content-start scrollable hide_scroll">
                    <a class={classNames(["is-active", isInfo()])} ref={detallesTab!}
                        onClick={() => setViewAndFocus(detallesTab!, "detalles")}
                    >
                        Detalles
                    </a>
                    <a class={classNames(["is-active", isContact()])} ref={contactosTab!}
                        onClick={() => setViewAndFocus(contactosTab!, "contacto")}
                    >
                        Contacto
                    </a>
                    <a class={classNames(["is-active", isSupplies()])} ref={suppliesTab!}
                        onClick={() => setViewAndFocus(suppliesTab!, "supplies")}
                    >
                        Suministros
                    </a>
                    <a class={classNames(["is-active", isReport()])} ref={reporteTab!}
                        onClick={() => setViewAndFocus(reporteTab!, "reporte")}
                    >
                        Reporte
                    </a>
                </p>

                <Switch>
                    <Match when={servicio.error}>
                        <Error title="Error cargando el servicio 🚧" subtitle=" " />
                    </Match>

                    <Match when={servicio.data && isInfo()}>
                        <form class="hide_scroll">
                            <label class="label">Datos del Cliente</label>
                            <div class={classNames("field is-grouped is-flex-direction-column", css.io_field)}>
                                <p class="control has-icons-left">
                                    <input disabled class="input has-text-link" type="text" value={`Folio: ${servicio.data?.folio}`} />
                                    <span class="icon is-medium is-left">
                                        <i class="fas fa-hashtag has-text-link" />
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

                    <Match when={servicio.data && isSupplies()}>
                        <SuppliesDetails
                            registros={servicio.data!.RegistroAplicacion || []}
                        />
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
                        <button type="button" class="button is-link is-outlined is-fullwidth" onClick={goHome}>
                            Regresar a servicios
                        </button>
                    </div>
                </Show>
            </nav>
        </Suspense>
    );
}