import { Tables } from "@/supabase";
import { destructure } from "@solid-primitives/destructure";
import { Show } from "solid-js";

type ContactProps = {
    responsable?: Tables<"Responsables">
}

export function ContactDetails(props: ContactProps) {
    if (!props.responsable) {
        return null;
    }

    const {
        nombre,
        puesto,
        email,
        telefono
    } = destructure(props.responsable!);

    return (
        <form>
            <div class="field is-grouped is-flex-direction-column">
                <label class="label">Responsable</label>
                <p class="control has-icons-left">
                    <input disabled class="input" type="text" value={nombre()} />
                    <span class="icon is-medium is-left">
                        <i class="fas fa-address-card" />
                    </span>
                </p>

                <label class="label">Puesto</label>
                <p class="control has-icons-left">
                    <input disabled class="input" value={puesto()} />
                    <span class="icon is-medium is-left">
                        <i class="fas fa-briefcase" />
                    </span>
                </p>
            </div>

            <div class="field is-grouped is-flex-direction-column">
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