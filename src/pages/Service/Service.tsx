import { createSignal, Match, onCleanup, onMount, Show, Suspense, Switch } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { Motion } from "solid-motionone";

import { getServiceByFolio } from "./Service.query";
import { Loading } from "@/components/Loading";
import { Tables } from "@/supabase";

import { ContactDetails, SuppliesDetails, ServiceReport } from "./components/";
import { classNames, FadeInAnimation, useSwipe } from "@/utils";
import { getLocalTime } from "@/utils/Date";
import { Tabs } from "./Service.types";
import { Error, Pages } from "..";

import { createQuery } from "@tanstack/solid-query";
import { match } from "ts-pattern";

import css from "./Service.module.css";
import { tabOrder } from "./Service.utils";

// Font Awesome Icons
import {
    FaSolidCalendarDays,
    FaSolidCircleQuestion,
    FaSolidClock,
    FaSolidClockRotateLeft,
    FaSolidFilePen,
    FaSolidHashtag,
    FaSolidUser,
    FaSolidWarehouse
} from "solid-icons/fa";


/** Tracks if the service component can use swipe gestures */
export const [canSwipe, setCanSwipe] = createSignal(true);

export function Service() {
    const { folio } = useParams();
    const navigate = useNavigate();
    const goHome = () => navigate(Pages.Home);

    const [view, setView] = createSignal<Tabs>("detalles");
    const isSupplies = () => view() === "suministros";
    const isContact = () => view() === "contacto";
    const isReport = () => view() === "reporte";
    const isInfo = () => view() === "detalles";

    /** Updates the service cache if requested by a child */
    document.addEventListener("UpdateService",
        () => servicio.refetch().then(() => {
            setView("detalles");
            setView("suministros");
        }));

    const onReportSubmit = () => window.setTimeout(
        () => servicio.refetch().then(() => {
            setView("detalles");
            setView("reporte");
        }), 1000);

    const servicio = createQuery(() => ({
        queryKey: [`service/${folio}`],
        queryFn: () => getServiceByFolio(folio),
        staleTime: 1000 * 60 * 5,
        throwOnError: false
    }));

    const fechaServicio = () => servicio.data
        ? new Date(`${servicio.data?.fecha_servicio}T${servicio.data?.horario_servicio}`)
        : undefined;

    function getClientName(cliente: Tables<"Clientes">) {
        const { nombre, apellidos } = cliente;
        return `${nombre} ${apellidos}`;
    }

    /** Sets the provided tab as the current view and scrolls to it */
    function setViewAndFocus(e: Event | KeyboardEvent) {
        if (e instanceof KeyboardEvent && e.key !== " " && e.key !== "Enter") {
            return;
        }

        const el = e.target instanceof HTMLElement ? e.target : null;
        const nextTab = el?.id as Tabs;

        const currViewIndex = tabOrder.findIndex(t => t === view());
        const nextViewIndex = tabOrder.findIndex(t => t == nextTab);
        const direction = currViewIndex < nextViewIndex ? "left" : "right";
        const nextView = tabOrder[nextViewIndex];

        window.requestAnimationFrame(() => {
            animateViewChange(direction, nextView);
        });
    }

    /** Element reference for the tab container  */
    let tabContainer: Maybe<HTMLTemplateElement>;

    /** Handles swiping between the different tab views  */
    const handleTabSwipe = (direction: 'left' | 'right', _distance: number) => {
        if (!canSwipe()) return;

        const currentTab = tabOrder.findIndex((tab) => tab === view());
        const nextTab = direction === "left"
            ? currentTab + 1
            : currentTab - 1;

        const nextView = tabOrder[nextTab];
        animateViewChange(direction, nextView);
    };

    /** Animates switching between the different service views */
    function animateViewChange(direction: "left" | "right", nextView: Tabs) {
        const transformEnd = direction === "left"
            ? "translateX(-100%)"
            : "translateX(100%)";

        if (nextView) {
            const animation = tabContainer?.animate(
                [
                    { transform: "translateX(0)", opacity: 1 }, // Starting state
                    { transform: transformEnd, opacity: 0 }, // Ending state
                ],
                {
                    duration: 300, // Duration in ms
                    easing: 'ease-in-out', // Easing function
                }
            );

            if (animation) animation.onfinish = () => {
                const el = document.getElementById(view());
                window.requestAnimationFrame(() => {
                    el?.scrollIntoView({ behavior: "smooth", inline: "center" });
                    setView(nextView);
                });
            }
        }
    }

    onMount(() => {
        if (tabContainer) {
            const cleanup = useSwipe(tabContainer, handleTabSwipe, { threshold: 80 });
            onCleanup(cleanup); // Ensure cleanup on component unmount
        }
    });

    return (
        <Suspense fallback={<Loading />}>
            <nav class="panel is-shadowless">
                <h1 class="title has-text-centered">
                    Servicio #{folio}
                </h1>

                <p class="panel-tabs is-justify-content-start scrollable hide_scroll">
                    <a class={classNames(["is-active", isInfo()])}
                        onKeyDown={setViewAndFocus}
                        onClick={setViewAndFocus}
                        id="detalles"
                        tabindex={0}
                    >
                        Detalles
                    </a>
                    <a class={classNames(["is-active", isContact()])}
                        onKeyDown={setViewAndFocus}
                        onClick={setViewAndFocus}
                        id="contacto"
                        tabindex={0}
                    >
                        Contacto
                    </a>
                    <a class={classNames(["is-active", isSupplies()])}
                        onKeyDown={setViewAndFocus}
                        onClick={setViewAndFocus}
                        id="suministros"
                        tabindex={0}
                    >
                        Suministros
                    </a>
                    <a class={classNames(["is-active", isReport()])}
                        onKeyDown={setViewAndFocus}
                        onClick={setViewAndFocus}
                        id="reporte"
                        tabindex={0}
                    >
                        Reporte
                    </a>
                </p>

                <Motion.template {...FadeInAnimation}
                    ref={tabContainer!}
                    class="is-block"
                    id={view()}
                >
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
                                            <FaSolidHashtag class="has-text-link" />
                                        </span>
                                    </p>
                                    <p class="control has-icons-left">
                                        <input disabled class="input" value={getClientName(servicio.data?.Clientes!)} />
                                        <span class="icon is-small is-left">
                                            <FaSolidUser />
                                        </span>
                                    </p>
                                </div>

                                <div class={classNames("field is-grouped is-flex-direction-column", css.io_field)}>
                                    <label class="label">Fecha de Servicio</label>
                                    <p class="control has-icons-left">
                                        <input disabled class="input" type="text" value={servicio.data?.fecha_servicio ?? "No asignada"} />
                                        <span class="icon is-medium is-left">
                                            <FaSolidCalendarDays />
                                        </span>
                                    </p>
                                    <label class="label">Hora de Servicio</label>
                                    <p class="control has-icons-left">
                                        <input disabled class="input" value={getLocalTime(fechaServicio()) || "No asignada"} />
                                        <span class="icon is-small is-left">
                                            <FaSolidClock />
                                        </span>
                                    </p>
                                </div>

                                <div class={classNames("field is-grouped is-flex-direction-column", css.io_field)}>
                                    <label class="label">Frecuencia del Servicio</label>
                                    <p class="control has-icons-left">
                                        <input disabled class="input" type="text" value={servicio.data?.frecuencia_recomendada || "No asignada"} />
                                        <span class="icon is-medium is-left">
                                            <FaSolidClockRotateLeft />
                                        </span>
                                    </p>
                                    <label class="label">Tipo de Servicio</label>
                                    <p class="control has-icons-left">
                                        <input disabled class="input" value={servicio.data?.tipo_servicio || "Sin tipo"} />
                                        <span class="icon is-small is-left">
                                            <FaSolidWarehouse />
                                        </span>
                                    </p>
                                </div>

                                <div class={classNames("field is-grouped is-flex-direction-column", css.io_field)}>
                                    <label class="label">Tipo de Folio</label>
                                    <p class="control has-icons-left">
                                        <input disabled class="input" type="text" value={servicio.data?.tipo_folio || "Sin tipo"} />
                                        <span class="icon is-medium is-left">
                                            <FaSolidFilePen />
                                        </span>
                                    </p>
                                    <label class="label">Estado del Servicio</label>
                                    <p class="control has-icons-left">
                                        <input disabled class="input" value={match(servicio.data)
                                            .with({ realizado: true }, () => "Realizado")
                                            .with({ cancelado: true }, () => "Cancelado")
                                            .otherwise(() => "Pendiente")} />
                                        <span class="icon is-small is-left">
                                            <FaSolidCircleQuestion />
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
                            />
                        </Match>

                        <Match when={servicio.data && isReport()}>
                            <ServiceReport service={servicio.data ?? undefined} onReportSubmit={onReportSubmit} />
                        </Match>
                    </Switch>
                </Motion.template>

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