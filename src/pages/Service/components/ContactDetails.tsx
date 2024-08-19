import { destructure } from "@solid-primitives/destructure";
import { Tables } from "@/supabase";
import { Show } from "solid-js";

type ContactProps = {
    responsable?: Tables<"Responsables">
}

export function ContactDetails(props: ContactProps) {
    if (!props.responsable) {
        return null;
    }

    const { responsable } = destructure(props);
    const contacto = () => responsable?.()!;

    return (
        <form>
            <label class="label">Datos del Contacto</label>
            <div class="field is-grouped is-flex-direction-column">
                <label class="label">Nombre</label>
                <p class="control has-icons-left">
                    <input disabled class="input" type="text" value={contacto().nombre} />
                    <span class="icon is-medium is-left">
                        <i class="fas fa-address-card" />
                    </span>
                </p>

                <label class="label">Puesto</label>
                <p class="control has-icons-left">
                    <input disabled class="input" value={contacto().puesto} />
                    <span class="icon is-medium is-left">
                        <i class="fas fa-briefcase" />
                    </span>
                </p>
            </div>

            <div class="field is-grouped is-flex-direction-column">
                <Show when={contacto().email && contacto().telefono}>
                    <label class="label">Correo</label>
                    <p class="control has-icons-left">
                        <a class="input" type="email" href={"mailto:" + contacto().email}>
                            {contacto().email}
                        </a>
                        <span class="icon is-small is-left">
                            <i class="fas fa-envelope" />
                        </span>
                    </p>

                    <label class="label">Teléfono</label>
                    <p class="control has-icons-left">
                        <a class="input" type="phone" href={`tel:+${contacto().telefono ?? ""}`}>
                            {contacto().telefono ?? ""}
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