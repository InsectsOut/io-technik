import { For, JSX, Match, Show, Suspense, Switch, createSignal } from "solid-js";
import { createQuery } from "@tanstack/solid-query";

import { Service, fetchServices } from "./Home.query";
import { deviceType, DeviceType, SlideDownFadeIn } from "@/utils";
import { Error, Pages } from "@/pages";
import { LocaleMX } from "@/constants";

import { Loading } from "@/components/";

import { Motion } from "solid-motionone";
import { match } from "ts-pattern";
import dayjs from "dayjs";

import "./Home.css";
import { FaSolidBan, FaSolidCheck, FaSolidChevronLeft, FaSolidChevronRight, FaSolidCircleInfo, FaSolidMapPin, FaSolidPhoneFlip, FaSolidXmark } from "solid-icons/fa";
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

function getSimpleTime({ fecha_servicio, horario_servicio }: Service) {
  return dayjs(`${fecha_servicio}T${horario_servicio}`)
    .format("hh:mm a");
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

function NoServices() {
  return (
    <>
      <h1 class="is-centered no-services">No hay servicios para hoy</h1>
      <div class="is-flex is-justify-content-center">
        <i class="fa-solid fa-beer-mug-empty empty-icon" />
      </div>
    </>
  )
}

export function Home() {

  const [filter, setFilter] = createSignal("");
  const lowerFilter = () => filter().toLowerCase();

  const setDay = (val?: number) => {
    if (val == null) {
      return () => setDate(dayjs());
    }

    return () => setDate(day => day.add(val, "day"));
  };

  const filteredServices = () => services.data?.filter((s) => {
    if (!lowerFilter()) {
      return services.data;
    }

    const nombreCliente = `${s.Clientes?.nombre} ${s.Clientes?.apellidos}`.toLowerCase();
    const folioFilter = parseInt(lowerFilter());

    if (!isNaN(folioFilter)) {
      return s.folio === folioFilter;
    }

    return nombreCliente.includes(lowerFilter());
  });

  const services = createQuery(() => ({
    queryKey: ["/service"],
    queryFn: () => fetchServices(),
    staleTime: 1000 * 60 * 5,
    throwOnError: false
  }));

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
                  type="button"
                  onClick={setDay(-1)}
                  class="button icon is-left"
                >
                  <FaSolidChevronLeft aria-hidden="true" />
                </button>

                <a class="is-active" onClick={setDay()}>Hoy</a>

                <button
                  type="button"
                  onClick={setDay(+1)}
                  class="button icon is-left"
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
                      <th class="has-text-centered no-pad-left">#</th>
                      <th>Horario</th>
                      <th>Cliente</th>
                      <th class="has-text-centered no-pad-right">Estatus</th>
                      <Show when={deviceType() > DeviceType.Mobile}>
                        <th class="is-flex is-justify-content-space-around is-misaligned" style={{ gap: "0.75rem" }}>
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
                      {service => {
                        const serviceStatus = match(service)
                          .with({ realizado: true }, () => "Realizado")
                          .with({ cancelado: true }, () => "Cancelado")
                          .otherwise(() => "Pendiente");

                        return (
                          <>
                            <tr class="is-pointer" onClick={() => toggleShownService(service)}>
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
                                <div title={serviceStatus}>
                                  {deviceType() > DeviceType.Tablet ? serviceStatus : getStatusIcon(service)}
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
                        );
                      }}
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

        <a title="Compartir" href="" onClick={() => Share(service)}>
          <span class="icon is-left">
            <FiSend class="is-size-5" aria-hidden="true" />
          </span>
        </a>
      </div>
    </td>
  )
}
