import { For, createSignal } from "solid-js";

import { Locale } from "@/constants";
import { createQuery } from "@tanstack/solid-query";
import { Service, fetchServices } from "./Home.service";

import "./Home.css";
import { Pages } from "..";
import dayjs from "dayjs";

const [date, setDate] = createSignal(dayjs());

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

  const setDay = (val: number) => {
    return () => setDate(day => day.add(val, "day"));
  };

  const filteredServices = () => servicesQuery
    .data?.filter(({ Clientes: c }) => {
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
    queryFn: () => fetchServices(true, date()),
    staleTime: 1000 * 60 * 10,
    throwOnError: false
  }));

  return (
    <nav class="panel is-shadowless">
      <p class="panel-heading io-heading">Servicios</p>
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
          <button
            onClick={setDay(-1)}
            class="button icon is-left"
          >
            <i class="fas fa-chevron-left" aria-hidden="true" />
          </button>

          <a class="is-active">Hoy</a>

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
                    <a target="_blank" href="https://maps.app.goo.gl/kuAaMUd9x9qzMAP3A">
                      <span class="icon is-left">
                        <i class="fas fa-location-dot fa-lg" aria-hidden="true" />
                      </span>
                    </a>
                  </td>
                  <td class="icon-col">
                    <a href={`tel:+${service.Clientes?.telefono}`}>
                      <span class="icon is-left">
                        <i class="fas fa-phone-flip fa-lg" aria-hidden="true" />
                      </span>
                    </a>
                  </td>
                  <td class="icon-col">
                    <a href={Pages.Feedback}>
                      <span class="icon is-left">
                        <i class="fas fa-circle-info fa-lg" aria-hidden="true" />
                      </span>
                    </a>
                  </td>
                  <td class="icon-col">
                    <a href="#" onClick={() => Share(service)}>
                      <span class="icon is-left">
                        <i class="fas fa-share-nodes fa-lg" aria-hidden="true" />
                      </span>
                    </a>
                  </td>
                </tr>
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
