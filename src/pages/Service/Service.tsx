import { createMemo, createSignal, Match, onCleanup, onMount, Show, Suspense, Switch } from "solid-js";
import { BeforeLeaveEventArgs, useBeforeLeave, useNavigate, useParams } from "@solidjs/router";
import { Motion } from "solid-motionone";

import { createQuery } from "@tanstack/solid-query";
import { Tables } from "@/supabase";

import { ContactDetails, SuppliesDetails, ServiceReport } from "./components/";
import { getServiceByFolio, ServiceDetails } from "./Service.query";
import { getServiceStatus, tabOrder } from "./Service.utils";
import { Tabs } from "./Service.types";

import { classNames, FadeInAnimation, scrollIntoView, useSwipe } from "@/utils";
import { Loading } from "@/components/Loading";
import { getLocalTime } from "@/utils/Date";
import { employeeProfile } from "@/state";
import { Error, Pages } from "@/pages";
import { Modal } from "@/components";

import { TbProgressAlert } from "solid-icons/tb";
import { FiShare } from "solid-icons/fi";
import { match } from "ts-pattern";

// Font Awesome Icons
import {
    FaSolidBriefcase,
    FaSolidCalendarDays,
    FaSolidCheck,
    FaSolidClipboardUser,
    FaSolidClock,
    FaSolidClockRotateLeft,
    FaSolidFilePen,
    FaSolidHashtag,
    FaSolidMoneyBill,
    FaSolidUser,
    FaSolidWarehouse,
    FaSolidXmark
} from "solid-icons/fa";

import css from "./Service.module.css";

/** Tracks if the service component can use swipe gestures */
export const [canSwipe, setCanSwipe] = createSignal(true);
/* Tracks if there are unsaved changes in the service */
export const [changesUnsaved, setChangesUnsaved] = createSignal(false);

/** Shares a service's details with the current tab as its target */
function Share(service: ServiceDetails, tab: Tabs) {
    const { Clientes: c, folio } = service;
    if (!c || !folio) return;

    const firstChar = tab?.charAt(0);
    const tabToUpper = tab?.replace(firstChar, firstChar.toUpperCase());

    navigator.share({
        title: `Servicio #${folio} | ${tabToUpper}`,
        text: `${c.nombre} ${c.apellidos} - ${service.fecha_servicio}`,
        url: `${Pages.Services}/${folio}/${tab}`
    });
}

/** Route parameters for the service page */
type ServiceParams = { folio: string; org: string, tab?: Tabs };

let changeViewEv: Maybe<Event | KeyboardEvent>;
let lastSwipe: Maybe<[direction: 'left' | 'right', _distance: number]>;
let navEvent: Maybe<BeforeLeaveEventArgs>;

export function Service() {
    const { org, folio, tab } = useParams<ServiceParams>();
    const navigate = useNavigate();
    const goHome = () => navigate(Pages.Home);

    const [view, setView] = createSignal(tab ?? "detalles");
    const [showConfirm, setShowConfirm] = createSignal(false);
    const isSupplies = () => view() === "suministros";
    const isContact = () => view() === "contacto";
    const isReport = () => view() === "reporte";
    const isInfo = () => view() === "detalles";

    /** Updates the service cache if requested by a child */
    document.addEventListener("UpdateService",
        () => query.refetch().then(() => {
            setView("detalles");
            setView("suministros");
        }));

    const onServiceUpdate = () => window.setTimeout(
        () => query.refetch().then(() => {
            setView("detalles");
            setView("reporte");
        }), 1000);

    /** Creates a query to fetch the requested service, caches data for 1m */
    const query = createQuery(() => ({
        queryKey: [`service/${folio}/${org}`],
        queryFn: () => getServiceByFolio(folio, org),
        staleTime: 1000 * 60 * 3,
        throwOnError: false
    }));

    /** Service entry associated with this page's `folio` */
    const service = () => query.data;
    const cliente = () => service()?.Clientes;
    const empleado = () => service()?.Empleados;
    const direccion = () => service()?.Direcciones;
    const responsable = () => service()?.Responsables;
    const costoServicio = () => `${(service()?.precio || 0.00).toFixed(2)} MXN`;

    const fechaServicio = () => service()
        ? new Date(`${service()?.fecha_servicio}T${service()?.horario_servicio}`)
        : undefined;

    function getClientName(cliente: Tables<"Clientes">) {
        const { nombre, apellidos } = cliente;
        return `${nombre} ${apellidos}`;
    }

    function onUnsavedChanges() {
        if (!changesUnsaved()) return;

        setChangesUnsaved(false);
        setShowConfirm(false);

        if (changeViewEv) {
            setAndFocusTab(changeViewEv);
        }

        if (lastSwipe) {
            const [direction, _distance] = lastSwipe;
            onTabSwipe(direction, _distance);
        }

        if (navEvent) {
            navEvent.retry(true);
        }

        changeViewEv = null;
        lastSwipe = null;
        navEvent = null;
    }

    /** Sets the provided tab as the current view and scrolls to it */
    function setAndFocusTab(e: Event | KeyboardEvent) {
        if (e instanceof KeyboardEvent && !["Enter", " "].includes(e.key)) {
            return;
        }

        const el = e.target instanceof HTMLElement ? e.target : null;
        const nextTab = el?.id as Tabs;

        // Return if the next tab is the same as the current one
        if (nextTab === view()) return;

        // If there are unsaved changes, prompt the user to save them
        if (changesUnsaved()) {
            changeViewEv = e;
            setShowConfirm(true);
            return e.preventDefault();
        }

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
    const onTabSwipe = (direction: 'left' | 'right', distance: number) => {
        if (!canSwipe()) return;

        if (changesUnsaved()) {
            lastSwipe = [direction, distance];
            return setShowConfirm(true);
        }

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
            const animation = tabContainer!.animate(
                [
                    { transform: "translateX(0)", opacity: 1 }, // Starting state
                    { transform: transformEnd, opacity: 0 }, // Ending state
                ],
                {
                    duration: 300, // Duration in ms
                    easing: 'ease-in-out', // Easing function
                }
            );

            animation.onfinish ??= () => {
                window.requestAnimationFrame(() => {
                    const el = document.getElementById(setView(nextView));
                    el && scrollIntoView(el);
                });
            }
        }
    }

    const StateIcon = createMemo(() => service() && match(getServiceStatus(service()!))
        .with("Realizado", () => <FaSolidCheck class="is-size-5" />)
        .with("Cancelado", () => <FaSolidXmark class="is-size-5" />)
        .otherwise(() => <TbProgressAlert class="is-size-5" />));

    onMount(() => {
        if (tabContainer) {
            const cleanup = useSwipe(tabContainer, onTabSwipe, { threshold: 70 });
            // Ensure cleanup on component unmount
            onCleanup(cleanup);
        }

        window.requestAnimationFrame(() => {
            const el = document.getElementById(view());
            el && window.setTimeout(() => scrollIntoView(el), 300);
        });
    });

    // Check if there are unsaved changes before leaving the page
    useBeforeLeave((leaveEvent) => {
        if (changesUnsaved()) {
            leaveEvent.preventDefault();
            navEvent = leaveEvent;
            setShowConfirm(true);
        }
    });

    return (
        <Suspense fallback={<Loading />}>
            <nav class="panel is-shadowless">
                <h1 class="title has-text-centered">
                    Servicio #{folio.toString().replace("-", "FT-")}
                </h1>
                <h2 class="subtitle has-text-centered">
                    {org}
                </h2>

                <p class="panel-tabs is-justify-content-start scrollable hide-scroll">
                    <a class={classNames(["is-active", isInfo()])}
                        onKeyDown={setAndFocusTab}
                        onClick={setAndFocusTab}
                        id="detalles"
                        tabindex={0}
                    >
                        Detalles
                    </a>
                    <a class={classNames(["is-active", isContact()])}
                        onKeyDown={setAndFocusTab}
                        onClick={setAndFocusTab}
                        id="contacto"
                        tabindex={0}
                    >
                        Contacto
                    </a>
                    <a class={classNames(["is-active", isSupplies()])}
                        onKeyDown={setAndFocusTab}
                        onClick={setAndFocusTab}
                        id="suministros"
                        tabindex={0}
                    >
                        Suministros
                    </a>
                    <a class={classNames(["is-active", isReport()])}
                        onKeyDown={setAndFocusTab}
                        onClick={setAndFocusTab}
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
                        <Match when={query.error}>
                            <Error title="Error cargando el servicio 🚧" subtitle=" " />
                        </Match>

                        <Match when={service() && isInfo()}>
                            <form class="hide-scroll">
                                <Show when={employeeProfile()?.tipo_rol === "superadmin" && empleado()}>
                                    <div class={classNames("field is-grouped is-flex-direction-column mb-5", css.io_field)}>
                                        <label class="label">Técnico Asignado</label>
                                        <p class="control has-icons-left">
                                            <input title="Técnico" disabled class="input" type="text" value={empleado()?.nombre} />
                                            <span class="icon is-medium is-left">
                                                <FaSolidClipboardUser />
                                            </span>
                                        </p>
                                        <label class="label">Organización</label>
                                        <p class="control has-icons-left">
                                            <input title="Organización" disabled class="input" value={empleado()?.organizacion ?? 'N/A'} />
                                            <span class="icon is-small is-left">
                                                <FaSolidBriefcase />
                                            </span>
                                        </p>
                                    </div>
                                </Show>

                                <div class={classNames("field is-grouped is-flex-direction-column mb-5", css.io_field)}>
                                    <label class="label">Costo Cotizado</label>
                                    <p class="control has-icons-left">
                                        <input title="Costo del servicio" disabled class="input" value={costoServicio()} />
                                        <span class="icon is-small is-left">
                                            <FaSolidMoneyBill />
                                        </span>
                                    </p>
                                </div>

                                <label class="label">Datos del Cliente</label>
                                <div class={classNames("field is-grouped is-flex-direction-column", css.io_field)}>
                                    <p class="control has-icons-left">
                                        <input title="Folio" disabled class="input has-text-link" type="text"
                                            value={`Folio: ${service()?.folio.toString().replace("-", "FT-")}`}
                                        />
                                        <span class="icon is-medium is-left">
                                            <FaSolidHashtag class="has-text-link" />
                                        </span>
                                    </p>
                                    <p class="control has-icons-left">
                                        <input title="Cliente" disabled class="input" value={getClientName(cliente()!)} />
                                        <span class="icon is-small is-left">
                                            <FaSolidUser />
                                        </span>
                                    </p>
                                </div>

                                <div class={classNames("field is-grouped is-flex-direction-column", css.io_field)}>
                                    <label class="label">Fecha de Servicio</label>
                                    <p class="control has-icons-left">
                                        <input title="Fecha de servicio" disabled class="input" type="text" value={service()?.fecha_servicio ?? "No asignada"} />
                                        <span class="icon is-medium is-left">
                                            <FaSolidCalendarDays />
                                        </span>
                                    </p>
                                    <label class="label">Hora de Servicio</label>
                                    <p class="control has-icons-left">
                                        <input title="Hora de servicio" disabled class="input" value={getLocalTime(fechaServicio()) || "No asignada"} />
                                        <span class="icon is-small is-left">
                                            <FaSolidClock />
                                        </span>
                                    </p>
                                </div>

                                <div class={classNames("field is-grouped is-flex-direction-column", css.io_field)}>
                                    <label class="label">Frecuencia del Servicio</label>
                                    <p class="control has-icons-left">
                                        <input title="Frecuencia de servicio" disabled class="input" type="text" value={service()?.frecuencia_recomendada || "No asignada"} />
                                        <span class="icon is-medium is-left">
                                            <FaSolidClockRotateLeft />
                                        </span>
                                    </p>
                                    <label class="label">Tipo de Servicio</label>
                                    <p class="control has-icons-left">
                                        <input title="Tipo de servicio" disabled class="input" value={service()?.tipo_servicio || "Sin tipo"} />
                                        <span class="icon is-small is-left">
                                            <FaSolidWarehouse />
                                        </span>
                                    </p>
                                </div>

                                <div class={classNames("field is-grouped is-flex-direction-column", css.io_field)}>
                                    <label class="label">Tipo de Folio</label>
                                    <p class="control has-icons-left">
                                        <input title="Tipo de folio" disabled class="input" type="text" value={service()?.tipo_folio || "Sin tipo"} />
                                        <span class="icon is-medium is-left">
                                            <FaSolidFilePen />
                                        </span>
                                    </p>
                                    <label class="label">Estado del Servicio</label>
                                    <p class="control has-icons-left">
                                        <input title="Estado del servicio" disabled class="input" value={match(service())
                                            .with({ realizado: true }, () => "Realizado")
                                            .with({ cancelado: true }, () => "Cancelado")
                                            .otherwise(() => "Pendiente")} />
                                        <span class="icon is-small is-left">
                                            {StateIcon()}
                                        </span>
                                    </p>
                                </div>
                            </form>
                        </Match>

                        <Match when={service() && isSupplies()}>
                            <SuppliesDetails
                                registros={service()!.RegistroAplicacion || []}
                            />
                        </Match>

                        <Match when={service() && isContact()}>
                            <ContactDetails
                                responsable={responsable()!}
                                direccion={direccion()!}
                            />
                        </Match>

                        <Match when={service() && isReport()}>
                            <ServiceReport service={service() ?? undefined} onServiceUpdate={onServiceUpdate} />
                        </Match>
                    </Switch>
                </Motion.template>

                <Show when={showConfirm()}>
                    <Modal show={true}>
                        <h2 class="subtitle has-text-centered">Hay cambios sin guardar</h2>

                        <div class="field is-flex is-justify-content-center gap-3">
                            <button class="column button is-danger is-outlined" onClick={() => setShowConfirm(false)}>
                                Cancelar
                            </button>
                            <button class="column button is-success is-outlined" onClick={() => onUnsavedChanges()}>
                                Continuar
                            </button>
                        </div>
                    </Modal>
                </Show>

                <Show when={!isReport()}>
                    <div class="field is-flex is-justify-content-center gap-3 mt-4">
                        <button
                            class="column button is-link is-outlined"
                            onClick={goHome}
                            type="button"
                        >
                            <span class="text-top">Regresar a servicios</span>
                        </button>

                        <Show when={navigator.share}>
                            <button
                                onClick={() => Share(service()!, view())}
                                class="column button is-info is-outlined"
                                type="button"
                            >
                                <span class="text-top">Compartir</span>
                                <span class="icon text-sub">
                                    <FiShare class="is-size-5" aria-hidden="true" />
                                </span>
                            </button>
                        </Show>
                    </div>
                </Show>
            </nav>
        </Suspense>
    );
}