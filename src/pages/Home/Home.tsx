import { For, createEffect, createSignal } from "solid-js";

import { Locale } from "@/constants";
import { createQuery } from "@tanstack/solid-query";
import { fetchServices } from "./Home.service";

import "./Home.css";
import { Pages } from "..";

const today = new Date();
const shortDate = today.toLocaleDateString(Locale, { dateStyle: "short" });
const fullDate = today.toLocaleDateString(Locale, { dateStyle: "full" });

export function Home() {

  const [filter, setFilter] = createSignal("");

  const filteredServices = () => servicesQuery
    .data?.filter(({ Clientes: c }) => {
      if (!filter()) {
        return servicesQuery.data;
      }

      return `${c?.nombre} ${c?.apellidos}`.includes(filter());
    });

  const servicesQuery = createQuery(() => ({
    queryKey: ["ServiceQuery"],
    queryFn: fetchServices,
    staleTime: 1000 * 60 * 10,
    throwOnError: false
  }));

  createEffect(() => {
    console.log(servicesQuery.data);
  })

  return (
    <nav class="panel">
      <p class="panel-heading io-heading has-background-grey">Servicios</p>
      <div class="panel-block">
        <p class="control has-icons-left">
          <input onInput={(e) => setFilter(e.target.value)}
            placeholder="Buscar servicio"
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
          <span class="icon is-left">
            <i class="fas fa-chevron-left" aria-hidden="true" />
          </span>
          <a class="is-active">Hoy</a>
          <span class="icon is-left">
            <i class="fas fa-chevron-right" aria-hidden="true" />
          </span>
        </p>

        <div class="panel-tabs is-align-items-center">
          <a class="has-text-grey-dark" title={fullDate}>
            {shortDate}
          </a>
        </div>
      </div>

      <div class="table-container io-table-container">
        <table class="table io-table">
          <thead>
            <tr>
              <th><abbr title="Horario">Hora</abbr></th>
              <th>Cliente</th>
              <th><abbr title="Dirección">Dir</abbr></th>
              <th><abbr title="Teléfono">Tel</abbr></th>
              <th><abbr title="Información">Info</abbr></th>
            </tr>
          </thead>
          <tbody>
            <For each={filteredServices()}>
              {(service) => (
                <tr>
                  <th>{service.horario_servicio}</th>
                  <td>{service.Clientes?.nombre} {service.Clientes?.apellidos}</td>
                  <td class="icon-col">
                    <a class="icon-link" href="https://maps.app.goo.gl/kuAaMUd9x9qzMAP3A">
                      <span class="icon is-left">
                        <i class="fas fa-location-dot fa-lg" aria-hidden="true" />
                      </span>
                    </a>
                  </td>
                  <td class="icon-col">
                    <a class="icon-link" href={`tel:+${service.Clientes?.telefono}`}>
                      <span class="icon is-left">
                        <i class="fas fa-phone-flip fa-lg" aria-hidden="true" />
                      </span>
                    </a>
                  </td>
                  <td class="icon-col">
                    <a class="icon-link" href={Pages.Feedback}>
                      <span class="icon is-left">
                        <i class="fas fa-circle-info fa-lg" aria-hidden="true" />
                      </span>
                    </a>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>

      <div class="panel-block">
        <button class="button is-link is-outlined is-fullwidth">
          Ver todos
        </button>
      </div>
    </nav>
  )
}
