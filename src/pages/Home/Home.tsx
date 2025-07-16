import { For, Index, JSX, Match, Show, Suspense, Switch, createEffect, createMemo, createSignal, onMount } from "solid-js";
import { debounce } from "@solid-primitives/scheduled";
import { createQuery } from "@tanstack/solid-query";
import { Motion } from "solid-motionone";

import { Service, fetchServices } from "./Home.query";

import { classNames, delay, deviceType, DeviceType, SlideDownFadeIn } from "@/utils";
import { employeeProfile } from "@/state";
import { LocaleMX } from "@/constants";
import { Loading } from "@/components/";
import { Error, Pages } from "@/pages";
import { InputEvent } from "@/types";

import { match } from "ts-pattern";
import dayjs from "dayjs";

import { FaSolidBan, FaSolidCheck, FaSolidChevronDown, FaSolidChevronLeft, FaSolidChevronRight, FaSolidChevronUp, FaSolidCircleInfo, FaSolidFilter, FaSolidMagnifyingGlass, FaSolidMapPin, FaSolidPhoneFlip, FaSolidTrashCan, FaSolidXmark } from "solid-icons/fa";
import { getServiceStatus } from "../Service/Service.utils";
import { TbProgressAlert } from "solid-icons/tb";
import { FiSend } from "solid-icons/fi";

import { useSearchParams } from "@solidjs/router";
import { getShortDate } from "@/utils/Date";
import "./Home.css";

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

function ShareQuery() {
  const { searchParams } = new URL(window.location.href);
  const params = new URLSearchParams(searchParams);
  const info = params.get("search") || params.get("filter") || "Todos";

  navigator.share({
    title: "IO-Technik | Servicios",
    text: `Fecha: ${params.get("date")} ${info}`,
    url: window.location.href
  });
}

function NoServices(message: string) {
  return (
    <h1 class="is-centered no-services">
      {message}
    </h1>
  )
}

type LocalFilter = {
  estatus?: "realizado" | "cancelado" | "pendiente",
  organizacion?: "Leon" | "Queretaro" | "San Luis",
  hora?: string
};

type OrderBy = "estatus" | "cliente" | "hora" | "folio";

type OrderDir = "asc" | "desc";

type HomeQueryParams = {
  direction?: OrderDir;
  order?: OrderBy;
  filter?: string;
  search?: string;
  date?: string;
};

export function Home() {
  const [searchParams, updateParams] = useSearchParams<HomeQueryParams>();
  const [date, setDate] = createSignal(searchParams.date ? dayjs(searchParams.date) : dayjs());
  const [search, setSearch] = createSignal(searchParams.search ?? searchParams.filter ?? "");
  const [searchByFolio, setUseFolio] = createSignal(!!searchParams.search || false);
  const [direction, setDirection] = createSignal(searchParams.direction ?? "asc");
  const organizaciones = () => new Set(services.data?.map(s => s.organizacion));
  const [order, setOrder] = createSignal(searchParams.order ?? "hora");
  const [showFilters, setShowFilters] = createSignal(false);
  const [localFilter, setLocalFilter] = createSignal<LocalFilter>();
  const [infoShown, setInfoShown] = createSignal(NaN);
  const folioFilter = () => parseInt(search(), 10);
  const shortDate = () => getShortDate(date());

  createEffect(() => console.log("Local filter:", localFilter()));

  const fullDate = () => date().toDate()
    .toLocaleDateString(LocaleMX, { dateStyle: "full" });

  const updateSearch = debounce((search: string) => {
    setSearch(search);
    updateParams(
      { [searchByFolio() ? "search" : "filter"]: search },
      { replace: false }
    );
  }, 400);

  function toggleShownService(service: Service) {
    return setInfoShown(
      id => id !== service.id
        ? service.id
        : NaN
    );
  }

  function clearFilters() {
    const today = setDate(dayjs());
    setDirection("asc");
    setUseFolio(false);
    setOrder("hora");
    setSearch("");

    updateParams(
      {
        date: getShortDate(today),
        direction: undefined,
        search: undefined,
        filter: undefined,
        order: undefined
      },
      { replace: false }
    );
  }

  function setOrderAndDir(order: OrderBy) {
    const direction = setDirection(d => d === "asc" ? "desc" : "asc");
    updateParams({ order, direction }, { replace: false });
    setOrder(order);
  }

  function setStatusFilter(e?: InputEvent<HTMLSelectElement>) {
    const estatus = e?.target.value as LocalFilter["estatus"];
    setLocalFilter(filter => ({ ...filter, estatus }));
  }

  function setTimeFilter(e?: InputEvent<HTMLInputElement>) {
    setLocalFilter(filter => ({ ...filter, hora: e?.target.value || "" }));
  }

  function setOrgFilter(e?: InputEvent<HTMLSelectElement>) {
    const organizacion = e?.target.value as LocalFilter["organizacion"];
    setLocalFilter(filter => ({ ...filter, organizacion }));
  }

  function resetLocalFilter() {
    setLocalFilter(undefined);
    const statusFilter = document.getElementById("status-filter") as HTMLSelectElement;
    const orgFilter = document.getElementById("org-filter") as HTMLSelectElement;
    const timeFilter = document.getElementById("time-filter") as HTMLInputElement;

    statusFilter.value = "";
    timeFilter.value = "";
    orgFilter.value = "";
  }

  function toggleSearch() {
    updateParams({ search: undefined, filter: undefined }, { replace: false });
    const folioSearch = setUseFolio(x => !x);
    const validFolio = !isNaN(folioFilter());

    if (validFolio) {
      services.refetch();
    }

    if (!folioSearch) {
      setSearch("");
    }
  }

  function filterServices(s: Service): boolean {
    if (!search()) {
      return filterLocal(s);
    }

    if (!isNaN(folioFilter())) {
      return filterLocal(s) && s.folio.toString().startsWith(search());
    }

    return filterLocal(s) && getClientName(s).toLowerCase()
      .includes(search().toLowerCase());
  }

  function filterLocal(s: Service) {
    const filter = localFilter();
    if (!filter) {
      return true;
    }

    const { estatus, organizacion, hora } = filter;
    const serviceStatus = getServiceStatus(s).toLowerCase();
    const serviceTime = getSimpleDate(s).format("HH:mm");
    const serviceOrg = s.organizacion?.toLowerCase();

    return (!estatus || serviceStatus === estatus.toLowerCase())
      && (!organizacion || serviceOrg === organizacion.toLowerCase())
      && (!hora || serviceTime.startsWith(hora));
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
    const date = getShortDate(days
      ? setDate(day => day.add(days, "day"))
      : setDate(dayjs())
    );

    updateParams({ date }, { replace: false });
  }

  const pickDate = (e: InputEvent<HTMLInputElement>) => {
    updateParams({ date: e.target.value }, { replace: false });
    setDate(dayjs(e.target.value));
  };

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

  /** Query that fetches service data by query after a delay of `500ms` */
  const serviceQuery = (): Promise<Service[] | null> => delay(500).then(() =>
    fetchServices(date(), searchByFolio() ? folioFilter() : undefined)
  );

  const serviceQueryKey = () => `/service-${searchByFolio() ? folioFilter() : date()}`

  const services = createQuery(() => ({
    queryKey: [serviceQueryKey()],
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
                  onClick={() => setDay(-1)}
                  type="button"
                  title="Ayer"
                >
                  <FaSolidChevronLeft aria-hidden="true" />
                </button>

                <a class="is-active" onClick={() => setDay()}>
                  Ir a hoy
                </a>

                <button
                  class="button icon is-left"
                  onClick={() => setDay(+1)}
                  title="Mañana"
                  type="button"
                >
                  <FaSolidChevronRight aria-hidden="true" />
                </button>
              </p>

              <div class="panel-tabs is-align-items-center is-gap-1">
                <p class="is-borderless" title={fullDate()}>
                  <input class="input" type="date" name="day" value={shortDate()} onChange={pickDate} />
                </p>

                <Show when={true}>
                  <div class={classNames("dropdown is-right", ["is-active", showFilters()])}>
                    <div class="dropdown-trigger" onClick={() => setShowFilters(x => !x)}>
                      <button class="button" style={{ width: "100px" }} type="button">
                        <span class="text-top">Filtrar</span>
                        <span class="icon">
                          <FaSolidFilter />
                        </span>
                      </button>
                    </div>
                    <div class="dropdown-menu" id="dropdown-menu" role="menu">
                      <div class={classNames(
                        ["is-flex-direction-column", deviceType() <= DeviceType.Mobile],
                        "dropdown-content is-flex")
                      }>
                        <div class="cell field mx-1">
                          <label class="label">Estatus</label>
                          <div class="select is-normal">
                            <select id="status-filter" onChange={setStatusFilter}>
                              <option selected value="">TODOS</option>
                              <option>REALIZADO</option>
                              <option>CANCELADO</option>
                              <option>PENDIENTE</option>
                            </select>
                          </div>
                        </div>

                        <div class="cell field mx-1">
                          <label class="label">Hora</label>
                          <input id="time-filter" class="input is-block" type="time" onChange={setTimeFilter} />
                        </div>

                        <div class="cell field mx-1">
                          <label class="label">Organización</label>
                          <div class="select is-normal">
                            <select id="org-filter" onChange={setOrgFilter}>
                              <option value="">TODAS</option>
                              <Index each={Array.from(organizaciones())}>
                                {(org) => <option>{org()}</option>}
                              </Index>
                            </select>
                          </div>
                        </div>

                        <div class="cell field mx-1">
                          <label class="label">Borrar</label>
                          <button class="button is-outlined is-danger is-flex-grow-1"
                            onClick={resetLocalFilter}
                            type="button"
                          >
                            <span class="icon">
                              <FaSolidTrashCan />
                            </span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </Show>
              </div>
            </div>
          </Show>

          <Show when={filteredServices()?.length} fallback={NoServices(emptyMessage())}>
            <div class="scroll-hint-wrapper hide-scroll test">
              <div class="table-container io-table-container hide-scroll is-clickable">
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
                                  <span class="tag is-info tag-w">
                                    {s.organizacion}
                                  </span>
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
              <div class="scroll-hint-right" />
            </div>
          </Show>

          <div class="panel-block reset-filter gap-3 p-0" style={{ height: "5dvh" }}>
            <button type="button"
              onClick={clearFilters}
              class="button is-danger is-outlined is-fullwidth"
            >
              Quitar filtros
            </button>

            <Show when={'share' in navigator}>
              <button type="button"
                onClick={ShareQuery}
                class="button is-info is-outlined is-fullwidth"
              >
                Compartir búsqueda
              </button>
            </Show>
          </div>
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
