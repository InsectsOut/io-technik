import { For, JSX, Match, Show, Suspense, Switch, createEffect, createSignal } from "solid-js";
import { createQuery } from "@tanstack/solid-query";
import { Motion } from "solid-motionone";

import { Service, fetchServices } from "./Home.query";

import { classNames, compareStrings, deviceType, DeviceType, SlideDownFadeIn } from "@/utils";
import { employeeProfile } from "@/state";
import { LocaleMX } from "@/constants";
import { Loading } from "@/components/";
import { Error, Pages } from "@/pages";

import { match } from "ts-pattern";
import dayjs from "dayjs";

import "./Home.css";

import { FaSolidBan, FaSolidCheck, FaSolidChevronDown, FaSolidChevronLeft, FaSolidChevronRight, FaSolidChevronUp, FaSolidCircleInfo, FaSolidMapPin, FaSolidPhoneFlip, FaSolidXmark } from "solid-icons/fa";
import { getServiceStatus } from "../Service/Service.utils";
import { TbProgressAlert, TbSearch } from "solid-icons/tb";
import { FiSend } from "solid-icons/fi";

const [date, setDate] = createSignal(dayjs());
const [infoShown, setInfoShown] = createSignal(NaN);

function toggleShownService(service: Service) {
  return setInfoShown(
    id => id !== service.id
      ? service.id
      : NaN
  );
}

function getStatusIcon(service: Service) {
  const StatusIcon = match(service)
    .with({ realizado: true }, () => <FaSolidCheck class="has-text-primary is-size-4" />)
    .with({ cancelado: true }, () => <FaSolidXmark class="has-text-danger is-size-4" />)
    .otherwise(() => <TbProgressAlert class="has-text-warning is-size-4" />);

  return (
    <span class="icon is-left">
      {StatusIcon}
    </span>
  );
}

function getSimpleDate({ fecha_servicio, horario_servicio }: Service) {
  return dayjs(`${fecha_servicio}T${horario_servicio}`);
}

function getSimpleTime(s: Service) {
  return getSimpleDate(s).format("hh:mm a");
}

/** Returns the provided service's client name */
function getClientName({ Clientes: c }: Service): string {
  return `${c?.nombre ?? ""} ${c?.apellidos ?? ""}`;
}

const shortDate = () => date()
  .format("DD/MM/YY");

const fullDate = () => date().toDate()
  .toLocaleDateString(LocaleMX, { dateStyle: "full" });

function Share(service: Service) {
  if (!service.Clientes) {
    return;
  }

  const { Clientes: c, folio } = service;

  navigator.share({
    title: `Servicio con folio #${folio}`,
    text: `${c.nombre} ${c.apellidos} - ${service.fecha_servicio}`,
    url: `${Pages.Services}/${folio}`
  });
}

function scrollIntoView(el: HTMLElement) {
  window.setTimeout(() => el.scrollIntoView({
    behavior: "smooth",
    inline: "end"
  }), 200);
}

function NoServices() {
  return (
    <>
      <h1 class="is-centered no-services">
        No hay servicios para {date() === dayjs() ? "hoy" : shortDate()}
      </h1>
      <div class="is-flex is-justify-content-center">
        <i class="fa-solid fa-beer-mug-empty empty-icon" />
      </div>
    </>
  )
}

type OrderBy = "estatus" | "tel" | "cliente" | "hora" | "folio";

type OrderDir = "asc" | "desc";

export function Home() {
  const [direction, setDirection] = createSignal<OrderDir>("asc");
  const [order, setOrder] = createSignal<OrderBy>("hora");
  const [filter, setFilter] = createSignal("");
  const lowerFilter = () => filter().toLowerCase();
  const setOrderAndDir = (order: OrderBy) => {
    setDirection(d => d === "asc" ? "desc" : "asc");
    setOrder(order);
  }

  function filterServices(s: Service) {
    if (!lowerFilter()) {
      return services.data;
    }

    const folioFilter = parseInt(lowerFilter());

    if (!isNaN(folioFilter)) {
      return s.folio === folioFilter;
    }

    return getClientName(s).toLowerCase().includes(lowerFilter());
  }

  function orderServices(s1: Service, s2: Service) {
    const dir = direction() === "asc" ? 1 : -1;
    const tel1 = s1.Clientes?.telefono ?? "";
    const tel2 = s2.Clientes?.telefono ?? "";

    const newOrder = match(order())
      .with("estatus", () => getServiceStatus(s1).localeCompare(getServiceStatus(s2)))
      .with("cliente", () => getClientName(s1).localeCompare(getClientName(s2)))
      .with("hora", () => getSimpleDate(s1).isBefore(getSimpleDate(s2)) ? -1 : 1)
      .with("tel", () => compareStrings(tel1, tel2))
      .otherwise(() => s1.folio - s2.folio);

    return newOrder * dir;
  }

  function getSortIcon(icon: OrderBy) {
    const isSelected = icon === order();
    const iconClass = classNames(
      "is-size-6 is-clickable",
      isSelected
        ? "has-text-primary"
        : "has-text-grey"
    );

    return icon !== order() || direction() === "asc"
      ? <FaSolidChevronDown class={iconClass} />
      : <FaSolidChevronUp class={iconClass} />;
  }

  const setDay = (days?: number) => {
    return days != null
      ? () => setDate(day => day.add(days, "day"))
      : () => setDate(dayjs());
  };

  const filteredServices = () => services.data
      ?.filter(filterServices)
      .toSorted(orderServices);

  const services = createQuery(() => ({
    queryKey: [`/service-${shortDate()}`],
    queryFn: () => fetchServices(date()),
    staleTime: 1000 * 60 * 5,
    throwOnError: false
  }));

  // Updates the services shown once we can filter by employee
  createEffect(() => {
    if (employeeProfile()) {
      services.refetch();
    }
  });

  return (
    <Suspense fallback={<Loading message="Cargando servicios..." />}>
      <Switch>
        <Match when={services.error}>
          <Error title="Error cargando servicios 🚧" subtitle=" " link_txt="Reintentar" />
        </Match>

        <Match when={services.data}>
          <nav class="panel is-shadowless">
            <h1 class="title no-padding has-text-centered">Servicios</h1>
            <div class="panel-block">
              <p class="control has-icons-left">
                <input onInput={(e) => setFilter(e.target.value)}
                  placeholder="Buscar por cliente o folio..."
                  value={filter()}
                  class="input"
                  type="text"
                />
                <span class="icon is-left">
                  <TbSearch aria-hidden="true" class="is-size-4" />
                </span>
              </p>
            </div>
            <div class="panel-tabs is-align-items-center is-justify-content-space-between">
              <p class="panel-tabs is-align-items-center is-borderless">
                <button
                  class="button icon is-left"
                  onClick={setDay(-1)}
                  type="button"
                  title="Ayer"
                >
                  <FaSolidChevronLeft aria-hidden="true" />
                </button>

                <a class="is-active" onClick={setDay()}>Hoy</a>

                <button
                  class="button icon is-left"
                  onClick={setDay(+1)}
                  title="Mañana"
                  type="button"
                >
                  <FaSolidChevronRight aria-hidden="true" />
                </button>
              </p>

              <div class="panel-tabs is-align-items-center">
                <a class="has-text-grey-dark is-borderless" title={fullDate()}>
                  {shortDate()}
                </a>
              </div>
            </div>

            <Show when={services.data?.length} fallback={<NoServices />}>
              <div class="table-container io-table-container hide_scroll">
                <table class="table io-table">
                  <thead>
                    <tr>
                      <th class="has-text-centered no-pad-left" onClick={() => setOrderAndDir("folio")}>
                        <span class="icon-text is-flex-wrap-nowrap">
                          <span>#</span>
                          <span class="icon">
                            {getSortIcon("folio")}
                          </span>
                        </span>
                      </th>
                      <th onClick={() => setOrderAndDir("hora")}>
                        <span class="icon-text is-flex-wrap-nowrap">
                          <span>Horario</span>
                          <span class="icon">
                            {getSortIcon("hora")}
                          </span>
                        </span>
                      </th>
                      <th onClick={() => setOrderAndDir("cliente")}>
                        <span class="icon-text is-flex-wrap-nowrap">
                          <span>Cliente</span>
                          <span class="icon">
                            {getSortIcon("cliente")}
                          </span>
                        </span>
                      </th>
                      <th class="has-text-centered no-pad-right" ref={scrollIntoView} onClick={() => setOrderAndDir("estatus")}>
                        <span class="icon-text is-flex-wrap-nowrap">
                          <span>Estatus</span>
                          <span class="icon">
                            {getSortIcon("estatus")}
                          </span>
                        </span>
                      </th>
                      <Show when={deviceType() > DeviceType.Mobile}>
                        <th class="is-flex is-justify-content-space-around is-misaligned gap-3">
                          <div class="has-text-centered">Teléfono</div>
                          <div class="has-text-centered">Información</div>
                          <div class="has-text-centered">Ubicación</div>
                          <div class="has-text-centered">Compartir</div>
                        </th>
                      </Show>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={filteredServices()}>
                      {service => (
                        <>
                          <tr class="is-clickable" onClick={() => toggleShownService(service)}>
                            <th class="no-pad-left">{service.folio}</th>
                            <th>{getSimpleTime(service)}</th>
                            <td>
                              <Show when={deviceType() > DeviceType.Mobile} fallback={
                                <span>{service.Clientes?.nombre} {service.Clientes?.apellidos}</span>
                              }>
                                <a href={`${Pages.Services}/${service.folio}`}>
                                  {service.Clientes?.nombre} {service.Clientes?.apellidos}
                                </a>
                              </Show>
                            </td>
                            <td class="icon-col has-text-centered no-pad-right">
                              <div title={getServiceStatus(service)}>
                                {deviceType() > DeviceType.Tablet ? getServiceStatus(service) : getStatusIcon(service)}
                              </div>
                            </td>
                            <Show when={deviceType() > DeviceType.Mobile}>
                              <HomeActions service={service} />
                            </Show>
                          </tr>
                          <Show when={infoShown() === service.id && deviceType() === DeviceType.Mobile}>
                            <Motion.tr {...SlideDownFadeIn}>
                              <HomeActions service={service} />
                            </Motion.tr>
                          </Show>
                        </>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>

            <Show when={filter()}>
              <div class="panel-block reset-filter">
                <button
                  type="button"
                  onClick={() => setFilter("")}
                  class="button is-link is-outlined is-fullwidth"
                >
                  Ver todos
                </button>
              </div>
            </Show>
          </nav>
        </Match>
      </Switch>
    </Suspense>
  );
}

function HomeActions({ service }: { service: Service }): JSX.Element {
  const { folio, Clientes, Direcciones: dir } = service;

  return (
    <td colSpan={4} class="icon-col">
      <div class="is-flex is-justify-content-space-around">
        <a title="Teléfono" href={`tel:${Clientes?.telefono}`}>
          <span class="icon is-left">
            <FaSolidPhoneFlip class="has-text-primary is-size-5" aria-hidden="true" />
          </span>
        </a>

        <a title="Información" href={`${Pages.Services}/${folio}`}>
          <span class="icon is-left">
            <FaSolidCircleInfo class="has-text-info is-size-5" aria-hidden="true" />
          </span>
        </a>

        <a classList={{ "disabled": !dir?.ubicacion }} rel="noopener" title="Ubicación" target="_blank" href={dir?.ubicacion!}>
          <span class="icon is-left">
            {dir?.ubicacion
              ? <FaSolidMapPin class="is-size-5 has-text-danger" aria-hidden="true" />
              : <FaSolidBan class="is-size-5 has-text-grey" aria-hidden="true" />}
          </span>
        </a>

        <Show when={'share' in navigator}>
          <a title="Compartir" href="" onClick={() => Share(service)}>
            <span class="icon is-left">
              <FiSend class="is-size-5" aria-hidden="true" />
            </span>
          </a>
        </Show>
      </div>
    </td>
  )
}
