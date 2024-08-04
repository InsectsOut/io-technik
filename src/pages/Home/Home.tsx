import { For, JSX, Show, createSignal } from "solid-js";
import { createWindowSize } from "@solid-primitives/resize-observer";
import { createQuery } from "@tanstack/solid-query";

import { DeviceType, getDeviceType } from "./Home.constants";
import { Service, fetchServices } from "./Home.query";
import { Locale } from "@/constants";

import { classNames } from "@/utils";
import { match } from "ts-pattern";
import dayjs from "dayjs";

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
  const icon = match(service)
    .with({ realizado: true }, () => "fa-check has-text-primary")
    .with({ cancelado: true }, () => "fa-xmark has-text-danger")
    .otherwise(() => "fa-hourglass-half has-text-warning");

  const iconClass = classNames("fas fa-lg", icon);

  return (
    <span class="icon is-left">
      <i class={iconClass} aria-hidden="true" />
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
  .toLocaleDateString(Locale, { dateStyle: "full" });

function Share(service: Service) {
  if (!service.Clientes) {
    return;
  }

  const { Clientes: c } = service;

  navigator.share({
    title: "Servicio",
    text: `Servicio de ${c.nombre} ${c.apellidos} - Fecha: ${service.fecha_servicio}`,
    url: "https://insectsout.com.mx/"
  });
}

export function Home() {

  const [filter, setFilter] = createSignal("");
  const size = createWindowSize();

  const setDay = (val?: number) => {
    if (val == null) {
      return () => setDate(dayjs());
    }

    return () => setDate(day => day.add(val, "day"));
  };

  const filteredServices = () => servicesQuery.data?.filter(({ Clientes: c }) => {
    if (!filter()) {
      return servicesQuery.data;
    }

    return `${c?.nombre} ${c?.apellidos}`
      .toLowerCase()
      .includes(
        filter().toLowerCase()
      );
  });

  const servicesQuery = createQuery(() => ({
    queryKey: ["/service"],
    queryFn: () => fetchServices(),
    staleTime: 1000 * 60 * 5,
    throwOnError: false
  }));

  return (
    <nav class="panel is-shadowless">
      <p class="panel-heading io-heading">Mis Servicios</p>
      <div class="panel-block">
        <p class="control has-icons-left">
          <input onInput={(e) => setFilter(e.target.value)}
            placeholder="Buscar por cliente..."
            value={filter()}
            class="input"
            type="text"
          />
          <span class="icon is-left">
            <i class="fas fa-search" aria-hidden="true" />
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
            <i class="fas fa-chevron-left" aria-hidden="true" />
          </button>

          <a class="is-active" onClick={setDay()}>Hoy</a>

          <button
            type="button"
            onClick={setDay(+1)}
            class="button icon is-left"
          >
            <i class="fas fa-chevron-right" aria-hidden="true" />
          </button>
        </p>

        <div class="panel-tabs is-align-items-center">
          <a class="has-text-grey-dark is-borderless" title={fullDate()}>
            {shortDate()}
          </a>
        </div>
      </div>
      <div class="table-container io-table-container">
        <table class="table io-table">
          <thead>
            <tr>
              <th>Horario</th>
              <th>Cliente</th>
              <th class="has-text-centered">Estatus</th>
              <Show when={getDeviceType(size.width) > DeviceType.Mobile}>
                <th class="is-flex is-justify-content-space-around is-misaligned">
                  <div class="has-text-centered">Teléfono</div>
                  <div class="has-text-centered">Información</div>
                  <div class="has-text-centered">Dirección</div>
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
                      <th>{getSimpleTime(service)}</th>
                      <td>{service.Clientes?.nombre} {service.Clientes?.apellidos}</td>
                      <td class="icon-col has-text-centered">
                        <div title={serviceStatus}>
                          {getDeviceType(size.width) > DeviceType.Tablet ? serviceStatus : getStatusIcon(service)}
                        </div>
                      </td>
                      <Show when={getDeviceType(size.width) > DeviceType.Mobile}>
                        <HomeActions service={service} />
                      </Show>
                    </tr>
                    <Show when={infoShown() === service.id && getDeviceType(size.width) === DeviceType.Mobile}>
                      <tr><HomeActions service={service} /></tr>
                    </Show>
                  </>
                );
              }}
            </For>
          </tbody>
        </table>
      </div>
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
  );
}

function HomeActions({ service }: { service: Service }): JSX.Element {
  return (
    <td colSpan={4}>
      <div class="is-flex is-justify-content-space-around">
        <a title="Teléfono" href={`tel:+${service.Clientes?.telefono}`}>
          <span class="icon is-left">
            <i class="fas fa-phone-flip fa-lg has-text-primary" aria-hidden="true" />
          </span>
        </a>

        <a title="Información" href={`/services/${service.id}`}>
          <span class="icon is-left">
            <i class="fas fa-circle-info fa-lg has-text-info" aria-hidden="true" />
          </span>
        </a>

        <a rel="noopener" title="Ubicación" target="_blank" href="https://maps.app.goo.gl/5LwiK1t1HzdeLiiQ7">
          <span class="icon is-left">
            <i class="fas fa-map-pin fa-lg has-text-danger" aria-hidden="true" />
          </span>
        </a>

        <a title="Compartir" href="#" onClick={() => Share(service)}>
          <span class="icon is-left">
            <i class="fas fa-share-nodes fa-lg" aria-hidden="true" />
          </span>
        </a>
      </div>
    </td>
  )
}
