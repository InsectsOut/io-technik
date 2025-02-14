import css from "./Profile.module.css";
import { Show } from "solid-js";
import { employeeProfile } from "@/state/Profile";
import insectsImg from "@/assets/insects-out-med.png";
import { currentSession } from "@/supabase";
import { destructure } from "@solid-primitives/destructure";
import { FaSolidAt, FaSolidBriefcase, FaSolidCakeCandles, FaSolidIdCard, FaSolidPhoneFlip } from "solid-icons/fa";

export function Profile() {
    if (!employeeProfile() || !currentSession()) {
        return <Show when={!employeeProfile}>Loading...</Show>;
    }

    const { puesto, nombre, organizacion, curp, fecha_nacimiento, telefono, tipo_rol } = destructure(employeeProfile()!);
    const { email } = destructure(currentSession()!.user);

    return (
        <div class={css.container}>
            <section class={`media is-flex-direction-row ${css.section} p-3`}>

                <div class="media-left">
                    <figure class="image is-64x64">
                        <img src={insectsImg} alt="User avatar" />
                    </figure>
                </div>

                <div class="media-content">
                    <div class="content">
                        <strong>{nombre()} | {tipo_rol()}</strong>
                        <br />
                        <span>@{puesto()}</span>
                        <br />
                    </div>
                </div>
            </section>

            <form class="form fullwidth">
                <label class="label">Correo</label>
                <p class="control has-icons-left m-4">
                    <input title="Correo" disabled class="input" value={email?.() ?? ""} />
                    <span class="icon is-medium is-left">
                        <FaSolidAt class="is-size-5" />
                    </span>
                </p>

                <Show when={telefono()}>
                    <label class="label">Teléfono</label>
                    <p class="control has-icons-left m-4">
                        <input title="Teléfono" disabled class="input" value={telefono()!} />
                        <span class="icon is-medium is-left">
                            <FaSolidPhoneFlip class="is-size-5" />
                        </span>
                    </p>
                </Show>

                <label class="label">Organización</label>
                <p class="control has-icons-left m-4">
                    <input title="Organización" disabled class="input" value={organizacion() ?? ""} />
                    <span class="icon is-medium is-left">
                        <FaSolidBriefcase class="is-size-5" />
                    </span>
                </p>

                <label class="label">Clave Única</label>
                <p class="control has-icons-left m-4">
                    <input title="CURP" disabled class="input" value={curp() ?? ""} />
                    <span class="icon is-medium is-left">
                        <FaSolidIdCard class="is-size-5" />
                    </span>
                </p>

                <label class="label">Cumpleaños</label>
                <p class="control has-icons-left m-4">
                    <input title="Cumpleaños" disabled class="input" value={fecha_nacimiento() ?? ""} />
                    <span class="icon is-medium is-left">
                        <FaSolidCakeCandles class="is-size-5" />
                    </span>
                </p>
            </form>
        </div>
    );
}