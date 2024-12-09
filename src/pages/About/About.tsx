import insectsImg from "@/assets/insects-out-med.png";
import insectsEmployee from "@/assets/insects_out_employee.png";
import menuOptions from "@/assets/home_options.png";
import { classNames } from "@/utils";
import css from "./About.module.css";

export function About() {
    return (
        <>
            <section class={classNames("hero is-medium is-link is-flex-direction-row", css['pad-rounded'])}>
                <div class="hero-body">
                    <p class="title">Insects Out</p>
                    <p class="subtitle">io-technik</p>
                </div>

                <figure class="image is-128x128 is-align-self-center">
                    <img class="is-rounded" src={insectsImg} />
                </figure>
            </section>

            <section class="hero is-medium">
                <div class="hero-body">
                    <p class="subtitle">Esta aplicación ha sido diseñada para simplificar el registro de servicios de control de plagas.</p>
                </div>
            </section>

            <section class={classNames("hero is-medium is-link", css['pad-rounded'])}>
                <div class="hero-body">
                    <p class="title is-spaced">Cómo usar la app?</p>
                    <p class="subtitle">Una vez registrado puedes ver tus servicios asignados, revisar sus datos y registrar detalles de servicio.</p>
                </div>

                <figure class="image is-align-self-center">
                    <img class="is-rounded" src={insectsEmployee} />
                </figure>
            </section>

            <section class="hero is-medium">
                <div class="hero-body">
                    <p class="title is-marginless">Inicio</p>
                    <ol class={css['pad-rounded']}>
                        <li>
                            <p>Elige un servicio de la pestaña de inicio</p>
                        </li>
                        <li>
                            <p>Da click en alguno de los servicios en la tabla para abrir y cerrar las opciones extras.</p>
                            <figure class={classNames("image", css.outlined, css['pad-rounded'])} style={{ margin: "1rem 0" }}>
                                <img src={menuOptions} />
                            </figure>
                        </li>
                        <li>
                            <p>Con el menú abierto las opciones disponibles son: teléfono, información, mapa y compartir.</p>
                            <ul>
                                <li>El botón de <i class="fas fa-phone-flip fa-lg has-text-primary" aria-hidden="true" />  te lleva a la aplicación de teléfono para marcar al teléfono del contacto asignado.</li>
                                <li>El botón de <i class="fas fa-circle-info fa-lg has-text-info" aria-hidden="true" />  te lleva a la página de detalles del servicio, donde están las pestañas de <strong>detalles, contacto y reporte de servicio</strong>.</li>
                                <li>El botón de <i aria-hidden="true" class="fas fa-lg has-text-danger fa-map-pin" />  abre la ubicación del servicio en tu mapa, si está disponible.</li>
                                <li>El botón de <i class="fas fa-share-nodes fa-lg has-text-warning" aria-hidden="true" />  abre el menú de compartir de tu celular para mandar una liga de servicio a otra persona.</li>
                            </ul>
                        </li>
                    </ol>
                </div>
            </section>
        </>
    );
}