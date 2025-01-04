import css from "./Profile.module.css";
import { Show } from "solid-js";
import { userProfile } from "@/state/Profile";
import insectsImg from "@/assets/insects-out-med.png";
import { currentSession } from "@/supabase";
import { destructure } from "@solid-primitives/destructure";

export function Profile() {
    if (!userProfile() || !currentSession()) {
        return <Show when={!userProfile}>Loading...</Show>;
    }

    const { puesto, nombre, organizacion, curp, fecha_nacimiento } = destructure(userProfile()!);
    const { email, phone } = destructure(currentSession()!.user);

    return (
        <div class={css.container}>
            <h1 class="title no-padding is-fullwidth">Tus Datos</h1>
            <section class="media" style={{ width: "85%" }}>

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

            <form class="form" style={{ width: "100%" }}>
                <label class="label">Datos Insects Out</label>
                <p class="control has-icons-left">
                    <input disabled class="input" value={email?.() ?? ""} />
                    <span class="icon is-medium is-left">
                        <i class="fas fa-at fa-lg" />
                    </span>
                </p>

                <p class="control has-icons-left">
                    <input disabled class="input" value={organizacion() ?? ""} />
                    <span class="icon is-medium is-left">
                        <i class="fas fa-briefcase fa-lg" />
                    </span>
                </p>

                <label class="label">Datos Personales</label>
                <p class="control has-icons-left">
                    <input disabled class="input" value={curp() ?? ""} />
                    <span class="icon is-medium is-left">
                        <i class="fas fa-id-card fa-lg" />
                    </span>
                </p>

                <p class="control has-icons-left">
                    <input disabled class="input" value={fecha_nacimiento() ?? ""} />
                    <span class="icon is-medium is-left">
                        <i class="fas fa-cake-candles fa-lg" />
                    </span>
                </p>

                <Show when={phone?.()}>
                    <p class="control has-icons-left">
                        <input disabled class="input" value={phone?.() ?? ""} />
                        <span class="icon is-medium is-left">
                            <i class="fas fa-at fa-lg" />
                        </span>
                    </p>
                </Show>
            </form>
        </div>
    );
}