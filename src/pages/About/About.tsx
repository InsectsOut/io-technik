import { FaSolidPhoneFlip, FaSolidCircleInfo, FaSolidMapPin } from "solid-icons/fa";
import insectsImg from "@/assets/insects-out-med.png";

import { classNames } from "@/utils";
import { FiSend } from "solid-icons/fi";

import css from "./About.module.css";

export function About() {
    return (
        <div class={classNames("hide-scroll auto-col-grid gap-0", css.scrollable)}>
            <section class="hero is-small is-flex-direction-row">
                <div class="hero-body">
                    <p class="title">Insects Out</p>
                    <p class="subtitle">io-technik</p>
                    <p class="subtitle">Esta aplicación ha sido diseñada para simplificar el registro de servicios de control de plagas.</p>
                </div>

                <figure class="image is-align-self-center">
                    <img class="is-rounded" src={insectsImg} />
                </figure>
            </section>

            <section class={classNames("hero is-small", css['pad-rounded'])}>
                <div class="hero-body">
                    <p class="title is-spaced">Cómo usar la app?</p>
                    <p class="subtitle">Una vez registrado puedes ver tus servicios asignados, revisar sus datos y registrar detalles de servicio.</p>
                </div>
            </section>

            <section class="hero is-small">
                <div class="hero-body">
                    <p class="title is-marginless">Inicio</p>
                    <ol class={css['pad-rounded']}>
                        <li>
                            <p>Elige un servicio de la pestaña de inicio</p>
                        </li>
                        <li>
                            <p>Da click en alguno de los servicios en la tabla para abrir y cerrar las opciones extras.</p>
                            <figure class={classNames("image my-4", css.outlined, css['pad-rounded'])}>
                                <img src="/home_options.png" />
                            </figure>
                        </li>
                        <li>
                            <p>Con el menú abierto las opciones disponibles son: teléfono, información, mapa y compartir.</p>
                            <ul>
                                <li>El botón de <FaSolidPhoneFlip class="has-text-primary is-size-5" aria-hidden="true" />  te lleva a la aplicación de teléfono para marcar al teléfono del contacto asignado.</li>
                                <li>El botón de <FaSolidCircleInfo class="has-text-info is-size-5" aria-hidden="true" />  te lleva a la página de detalles del servicio, donde están las pestañas de <strong>detalles, contacto y reporte de servicio</strong>.</li>
                                <li>El botón de <FaSolidMapPin class="is-size-5 has-text-danger" aria-hidden="true" />  abre la ubicación del servicio en tu mapa, si está disponible.</li>
                                <li>El botón de <FiSend class="is-size-5" aria-hidden="true" />  abre el menú de compartir de tu celular para mandar una liga de servicio a otra persona.</li>
                            </ul>
                        </li>
                    </ol>
                </div>
            </section>
        </div>
    );
}