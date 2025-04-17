import { For, JSX, Match, Show, Suspense, Switch, createMemo, createSignal, onMount } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";
import { createQuery } from "@tanstack/solid-query";
import { Motion } from "solid-motionone";

import { Service, fetchServices } from "./Home.query";

import { classNames, deviceType, DeviceType, scrollIntoView, SlideDownFadeIn } from "@/utils";
import { employeeProfile } from "@/state";
import { LocaleMX } from "@/constants";
import { Loading } from "@/components/";
import { Error, Pages } from "@/pages";
import { InputEvent } from "@/types";

import { match } from "ts-pattern";
import dayjs from "dayjs";

import { FaSolidBan, FaSolidCheck, FaSolidChevronDown, FaSolidChevronLeft, FaSolidChevronRight, FaSolidChevronUp, FaSolidCircleInfo, FaSolidFilter, FaSolidMagnifyingGlass, FaSolidMapPin, FaSolidPhoneFlip, FaSolidXmark } from "solid-icons/fa";
import { getServiceStatus } from "../Service/Service.utils";
import { TbProgressAlert } from "solid-icons/tb";
import { FiSend } from "solid-icons/fi";

import "./Home.css";

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
  const StatusIcon = createMemo(() => match(service)
    .with({ realizado: true }, () => <FaSolidCheck class="has-text-primary is-size-4" />)
    .with({ cancelado: true }, () => <FaSolidXmark class="has-text-danger is-size-4" />)
    .otherwise(() => <TbProgressAlert class="has-text-warning is-size-4" />));

  return (
    <span class="icon is-left">
      {StatusIcon()}
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
  .format("YYYY-MM-DD");

const fullDate = () => date().toDate()
  .toLocaleDateString(LocaleMX, { dateStyle: "full" });

function Share(service: Service) {
  if (!service.Clientes) {
    return;
  }

  const { Clientes: c, folio, organizacion: org } = service;

  navigator.share({
    title: `Servicio #${folio}`,
    text: `${c.nombre} ${c.apellidos} - ${service.fecha_servicio}`,
    url: `${Pages.Services}/${org}/${folio}`
  });
}

function NoServices(message: string) {
  return (
    <h1 class="is-centered no-services">
      {message}
    </h1>
  )
}

type OrderBy = "estatus" | "cliente" | "hora" | "folio";

type OrderDir = "asc" | "desc";

export function Home() {
  const [direction, setDirection] = createSignal<OrderDir>("asc");
  const [order, setOrder] = createSignal<OrderBy>("hora");
  const [searchByFolio, setUseFolio] = createSignal(false);
  const [search, setSearch] = createSignal("");
  const folioFilter = () => parseInt(search(), 10);
  const updateSearch = debounce(setSearch, 400);

  function setOrderAndDir(order: OrderBy) {
    setDirection(d => d === "asc" ? "desc" : "asc");
    setOrder(order);
  }

  function toggleSearch() {
    const folioSearch = setUseFolio(x => !x);
    const validFolio = !isNaN(folioFilter());

    if (validFolio) {
      services.refetch();
    }

    if (!folioSearch) {
      setSearch("");
    }
  }

  function filterServices(s: Service) {
    if (!search()) {
      return services.data;
    }

    if (!isNaN(folioFilter())) {
      return s.folio.toString().startsWith(search());
    }

    return getClientName(s).toLowerCase()
      .includes(search().toLowerCase());
  }

  function orderServices(s1: Service, s2: Service) {
    const dir = direction() === "asc" ? 1 : -1;
    const newOrder = match(order())
      .with("estatus", () => getServiceStatus(s1).localeCompare(getServiceStatus(s2)))
      .with("cliente", () => getClientName(s1).localeCompare(getClientName(s2)))
      .with("hora", () => getSimpleDate(s1).isBefore(getSimpleDate(s2)) ? -1 : 1)
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

  function setDay(days?: number) {
    return days != null
      ? () => setDate(day => day.add(days, "day"))
      : () => setDate(dayjs());
  }

  const pickDate = (e: InputEvent<HTMLInputElement>) => setDate(dayjs(e.target.value));

  const filteredServices = () => {
    if (searchByFolio()) {
      return services.data?.filter(s => s.folio === folioFilter());
    }

    return services.data
      ?.filter(filterServices)
      .toSorted(orderServices);
  };

  const emptyMessage = () => {
    if (searchByFolio()) {
      return "No se encontró un servicio con ese folio";
    }

    return search() || searchByFolio()
      ? "No hay servicios con ese filtro"
      : "No hay servicios para este día";
  };

  const serviceQuery = (): Promise<Service[] | null> => searchByFolio()
    ? fetchServices(date(), folioFilter())
    : fetchServices(date());

  const services = createQuery(() => ({
    queryKey: [`/service-${searchByFolio() ? folioFilter() : date()}`],
    queryFn: serviceQuery,
    staleTime: 1000 * 60 * 5,
    throwOnError: false
  }));

  // Updates the services shown once we can filter by employee
  onMount(() => {
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
            <h1 class="title p-0 has-text-centered">Servicios</h1>
            <h2 class="subtitle p-0 has-text-centered">{fullDate()}</h2>
            <div class="panel-block p-0 pb-2 is-flex is-gap-1 is-borderless">
              <p class="control">
                <input onInput={(e) => updateSearch(e.target.value)}
                  placeholder={searchByFolio() ? "Buscar folio..." : "Filtrar por nombre o folio..."}
                  value={search()}
                  class="input"
                  type="text"
                />
              </p>
              <button
                style={{ width: "100px" }}
                class={classNames("button is-outlined is-flex gap-2", searchByFolio() ? "is-success" : "is-info")}
                onClick={toggleSearch}
              >
                {searchByFolio() ? "Filtrar" : "Buscar"}
                {searchByFolio() ? <FaSolidFilter /> : <FaSolidMagnifyingGlass />}
              </button>
            </div>

            <Show when={!searchByFolio()}>
              <div class="panel-tabs is-align-items-center is-justify-content-space-between is-borderless">
                <p class="panel-tabs is-align-items-center is-borderless">
                  <button
                    class="button icon is-left"
                    onClick={setDay(-1)}
                    type="button"
                    title="Ayer"
                  >
                    <FaSolidChevronLeft aria-hidden="true" />
                  </button>

                  <a class="is-active" onClick={setDay()}>Ir a hoy</a>

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
                  <p class="is-borderless" title={fullDate()}>
                    <input class="input" type="date" name="day" value={shortDate()} onChange={pickDate} />
                  </p>
                </div>
              </div>
            </Show>

            <Show when={filteredServices()?.length} fallback={NoServices(emptyMessage())}>
              <div class="table-container io-table-container hide_scroll is-clickable">
                <table class="table io-table">
                  <thead>
                    <tr>
                      <th onClick={() => setOrderAndDir("folio")}
                        class="has-text-centered pl-0"
                        title="Folio"
                      >
                        <span class="icon-text is-flex-wrap-nowrap is-clickable">
                          <span>#</span>
                          <span class="icon">
                            {getSortIcon("folio")}
                          </span>
                        </span>
                      </th>
                      <th onClick={() => setOrderAndDir("hora")} title="Horario">
                        <span class="icon-text is-flex-wrap-nowrap is-clickable">
                          <span>Horario</span>
                          <span class="icon">
                            {getSortIcon("hora")}
                          </span>
                        </span>
                      </th>
                      <th onClick={() => setOrderAndDir("cliente")} title="Cliente">
                        <span class="icon-text is-flex-wrap-nowrap">
                          <span>Cliente</span>
                          <span class="icon">
                            {getSortIcon("cliente")}
                          </span>
                        </span>
                      </th>
                      <th onClick={() => setOrderAndDir("estatus")}
                        class="has-text-centered is-clickable"
                        ref={(el) => scrollIntoView(el)}
                        title="Estatus"
                      >
                        <span class="icon-text is-flex-wrap-nowrap">
                          <span>Estatus</span>
                          <span class="icon">
                            {getSortIcon("estatus")}
                          </span>
                        </span>
                      </th>
                      <Show when={deviceType() > DeviceType.Mobile}>
                        <td colSpan={4} class="icon-col">
                          <div class="is-flex is-justify-content-space-around gap-3">
                            <div title="Teléfono" class="has-text-centered "><strong>Teléfono</strong></div>
                            <div title="Información" class="has-text-centered"><strong>Información</strong></div>
                            <div title="Ubicación" class="has-text-centered"><strong>Ubicación</strong></div>
                            <div title="Compartir" class="has-text-centered"><strong>Compartir</strong></div>
                          </div>
                        </td>
                      </Show>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={filteredServices()}>
                      {s => (
                        <>
                          <tr class="is-clickable" onClick={() => toggleShownService(s)}>
                            <td class="pl-0 has-text-centered">
                              <div class="control">
                                <div class="tags has-addons is-flex-wrap-nowrap">
                                  <span class="tag is-info">{s.organizacion}</span>
                                  <span class="tag is-dark">
                                    {s.folio.toString().replace("-", "FT-")}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td><strong>{getSimpleTime(s)}</strong></td>
                            <td>
                              <Show when={deviceType() > DeviceType.Mobile} fallback={
                                <span>{s.Clientes?.nombre} {s.Clientes?.apellidos}</span>
                              }>
                                <a href={`${Pages.Services}/${s.organizacion}/${s.folio}`}>
                                  {s.Clientes?.nombre} {s.Clientes?.apellidos}
                                </a>
                              </Show>
                            </td>
                            <td class="icon-col has-text-centered">
                              <div title={getServiceStatus(s)}>
                                {deviceType() > DeviceType.Tablet ? getServiceStatus(s) : getStatusIcon(s)}
                              </div>
                            </td>
                            <Show when={deviceType() > DeviceType.Mobile}>
                              <HomeActions service={s} />
                            </Show>
                          </tr>
                          <Show when={infoShown() === s.id && deviceType() <= DeviceType.Mobile}>
                            <Motion.tr {...SlideDownFadeIn}>
                              <HomeActions service={s} />
                            </Motion.tr>
                          </Show>
                        </>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>

            <div class="panel-block reset-filter">
              <button type="button"
                onClick={() => setSearch("") || setUseFolio(false)}
                class="button is-link is-outlined is-fullwidth"
              >
                Quitar filtros
              </button>
            </div>
          </nav>
        </Match>
      </Switch>
    </Suspense>
  );
}

function HomeActions({ service }: { service: Service }): JSX.Element {
  const { folio, Clientes: c, Direcciones: dir, organizacion: org } = service;

  return (
    <>
      <td class="has-text-centered">
        <a title="Teléfono" href={`tel:${c?.telefono}`}>
          <span class="icon is-left">
            <FaSolidPhoneFlip class="has-text-primary is-size-5" aria-hidden="true" />
          </span>
        </a>
      </td>

      <td class="has-text-centered">
        <a title="Información" href={`${Pages.Services}/${org}/${folio}`}>
          <span class="icon is-left">
            <FaSolidCircleInfo class="has-text-info is-size-5" aria-hidden="true" />
          </span>
        </a>
      </td>

      <td class="has-text-centered">
        <a classList={{ "disabled": !dir?.ubicacion }}
          href={dir?.ubicacion!}
          title="Ubicación"
          target="_blank"
          rel="noopener"
        >
          <span class="icon is-left">
            {dir?.ubicacion
              ? <FaSolidMapPin class="is-size-5 has-text-danger" aria-hidden="true" />
              : <FaSolidBan class="is-size-5 has-text-grey" aria-hidden="true" />}
          </span>
        </a>
      </td>

      <td class="has-text-centered">
        <Show when={'share' in navigator}>
          <a title="Compartir" href="" onClick={() => Share(service)}>
            <span class="icon is-left">
              <FiSend class="is-size-5" aria-hidden="true" />
            </span>
          </a>
        </Show>
      </td>
    </>
  );
}
