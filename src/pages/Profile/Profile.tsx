import css from "./Profile.module.css";
import { Show } from "solid-js";
import { userProfile } from "@/state/Profile";
import insectsImg from "@/assets/insects-out-med.png";
import { currentSession } from "@/supabase";
import { destructure } from "@solid-primitives/destructure";
import { FaSolidAt, FaSolidBriefcase, FaSolidCakeCandles, FaSolidIdCard, FaSolidPhoneFlip } from "solid-icons/fa";

export function Profile() {
    if (!userProfile() || !currentSession()) {
        return <Show when={!userProfile}>Loading...</Show>;
    }

    const { puesto, nombre, organizacion, curp, fecha_nacimiento, telefono } = destructure(userProfile()!);
    const { email } = destructure(currentSession()!.user);

    return (
        <div class={css.container}>
            <section class={`media is-flex-direction-row ${css.section}`}>

                <div class="media-left">
                    <figure class="image is-64x64">
                        <img src={insectsImg} alt="User avatar" />
                    </figure>
                </div>

                <div class="media-content">
                    <div class="content">
                        <strong>{nombre()}</strong>
                        <br />
                        <span>@{puesto()}</span>
                        <br />
                    </div>
                </div>
            </section>

            <form class="form fullwidth">
                <label class="label">Correo</label>
                <p class="control has-icons-left m-4">
                    <input disabled class="input" value={email?.() ?? ""} />
                    <span class="icon is-medium is-left">
                        <FaSolidAt class="is-size-5" />
                    </span>
                </p>

                <Show when={telefono()}>
                    <label class="label">Teléfono</label>
                    <p class="control has-icons-left m-4">
                        <input disabled class="input" value={telefono()!} />
                        <span class="icon is-medium is-left">
                            <FaSolidPhoneFlip class="is-size-5" />
                        </span>
                    </p>
                </Show>

                <label class="label">Organización</label>
                <p class="control has-icons-left m-4">
                    <input disabled class="input" value={organizacion() ?? ""} />
                    <span class="icon is-medium is-left">
                        <FaSolidBriefcase class="is-size-5" />
                    </span>
                </p>

                <label class="label">Clave Única</label>
                <p class="control has-icons-left m-4">
                    <input disabled class="input" value={curp() ?? ""} />
                    <span class="icon is-medium is-left">
                        <FaSolidIdCard class="is-size-5" />
                    </span>
                </p>

                <label class="label">Cumpleaños</label>
                <p class="control has-icons-left m-4">
                    <input disabled class="input" value={fecha_nacimiento() ?? ""} />
                    <span class="icon is-medium is-left">
                        <FaSolidCakeCandles class="is-size-5" />
                    </span>
                </p>
            </form>
        </div>
    );
}