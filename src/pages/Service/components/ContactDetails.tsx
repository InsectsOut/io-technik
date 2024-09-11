import { destructure } from "@solid-primitives/destructure";
import { Tables } from "@/supabase";
import { classNames } from "@/utils";
import { Show } from "solid-js";

import css from "../Service.module.css";

type ContactProps = {
    responsable?: Tables<"Responsables">
}

export function ContactDetails(props: ContactProps) {
    if (!props.responsable) {
        return (
            <section class="no-contact">
                <h1 class="title has-text-centered">Sin contacto 🔎</h1>
                <h2 class="subtitle has-text-centered">No se encontraron datos de contacto para este servicio.</h2>
            </section>
        );
    }

    const {
        nombre,
        puesto,
        email,
        telefono
    } = destructure(props.responsable!);

    return (
        <form>
            <div class={classNames("field is-grouped is-flex-direction-column", css.io_field)}>
                <label class="label">Responsable</label>
                <p class="control has-icons-left">
                    <input disabled class="input" type="text" value={nombre() || "Sin información"} />
                    <span class="icon is-medium is-left">
                        <i class="fas fa-address-card" />
                    </span>
                </p>

                <label class="label">Puesto</label>
                <p class="control has-icons-left">
                    <input disabled class="input" value={puesto() || "Sin información"} />
                    <span class="icon is-medium is-left">
                        <i class="fas fa-briefcase" />
                    </span>
                </p>
            </div>

            <div class={classNames("field is-flex-direction-column", css.two_col_grid)}>
                <Show when={email() && telefono()}>
                    <label class="label">Correo</label>
                    <p class="control has-icons-left">
                        <a class="input" type="email" href={"mailto:" + email()}>
                            {email()}
                        </a>
                        <span class="icon is-small is-left">
                            <i class="fas fa-envelope" />
                        </span>
                    </p>

                    <label class="label">Teléfono</label>
                    <p class="control has-icons-left">
                        <a class="input" type="phone" href={`tel:+${telefono() ?? ""}`}>
                            {telefono() ?? ""}
                        </a>
                        <span class="icon is-small is-left">
                            <i class="fas fa-phone" />
                        </span>
                    </p>
                </Show>
            </div>
        </form>
    );
}