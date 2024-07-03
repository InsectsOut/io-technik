import { For, Show, createSignal } from "solid-js";

import { Locale } from "@/constants";
import { createQuery } from "@tanstack/solid-query";
import { Service, fetchServices } from "./Home.service";

import "./Home.css";
import { Pages } from "..";
import dayjs from "dayjs";
import { match } from "ts-pattern";

const [date, setDate] = createSignal(dayjs());
const [infoShown, setInfoShown] = createSignal(NaN);

function toggleShownService(service: Service) {
  return setInfoShown(
    id => id !== service.id
      ? service.id
      : NaN
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
    queryKey: ["ServiceQuery"],
    queryFn: () => fetchServices(),
    staleTime: 1000 * 60 * 10,
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
        <p class="panel-tabs is-align-items-center">
          <button
            onClick={setDay(-1)}
            class="button icon is-left"
          >
            <i class="fas fa-chevron-left" aria-hidden="true" />
          </button>

          <a class="is-active" onClick={setDay()}>Hoy</a>

          <button
            onClick={setDay(+1)}
            class="button icon is-left"
          >
            <i class="fas fa-chevron-right" aria-hidden="true" />
          </button>
        </p>

        <div class="panel-tabs is-align-items-center">
          <a class="has-text-grey-dark" title={fullDate()}>
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
              <th>Estatus</th>
            </tr>
          </thead>
          <tbody>
            <For each={filteredServices()}>
              {(service) => (
                <>
                  <tr class="is-pointer" onClick={() => toggleShownService(service)}>
                    <th>{getSimpleTime(service)}</th>
                    <td>{service.Clientes?.nombre} {service.Clientes?.apellidos}</td>
                    <td class="icon-col has-text-centered">
                      <a href="#" title={match(service)
                        .with({ realizado: true }, () => "Realizado")
                        .with({ cancelado: true }, () => "Cancelado")
                        .otherwise(() => "Pendiente")
                      }>
                        {match(service)
                          .with({ realizado: true }, () => "✔️")
                          .with({ cancelado: true }, () => "❌")
                          .otherwise(() => "⚒️")}
                      </a>
                    </td>
                  </tr>

                  <Show when={infoShown() === service.id}>
                    <tr><td colSpan={4}>
                      <div class="is-flex is-justify-content-space-around">
                        <a title="Teléfono" href={`tel:+${service.Clientes?.telefono}`}>
                          <span class="icon is-left">
                            <i class="fas fa-phone-flip fa-lg" aria-hidden="true" />
                          </span>
                        </a>

                        <a title="Información" href={Pages.Feedback}>
                          <span class="icon is-left">
                            <i class="fas fa-circle-info fa-lg" aria-hidden="true" />
                          </span>
                        </a>

                        <a title="Compartir" href="#" onClick={() => Share(service)}>
                          <span class="icon is-left">
                            <i class="fas fa-share-nodes fa-lg" aria-hidden="true" />
                          </span>
                        </a>
                      </div>
                    </td></tr>
                  </Show>
                </>
              )}
            </For>
          </tbody>
        </table>
      </div>

      <div class="panel-block reset-filter">
        <button
          onClick={() => setFilter("")}
          class="button is-link is-outlined is-fullwidth"
        >
          Ver todos
        </button>
      </div>
    </nav>
  )
}
