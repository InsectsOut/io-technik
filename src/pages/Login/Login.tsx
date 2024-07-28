import insectsImg from "@/assets/insects-out-med.png";
import { Auth, currentSession } from "@/supabase";
import { Navigate, useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import { Pages } from "..";

import css from "./Login.module.css";
import { classNames } from "@/utils";

const [email, setEmail] = createSignal("");
const [pass, setPass] = createSignal("");

export function Login() {
    const navigate = useNavigate();
    const signIn = (): Promise<string> => Auth
        .signIn(email(), pass())
        .then(({ data, error }) => {
            if (!data.user || error) {
                alert("Correo o contraseña incorrecta");
            } else {
                navigate("/home", { replace: true });
            }
        })
        .catch(console.error)
        .then(() => "Sesión iniciada");

    const formClass = classNames(
        "field is-grouped",
        "is-flex-direction-column",
        css.loginForm
    );

    return (
        <Show when={!currentSession()} fallback={<Navigate href={Pages.Home} />}>
            <div class={formClass}>

                <div class={css.loginHead}>
                    <img width={225} height={225}
                        alt="Logo de Insects Out"
                        src={insectsImg}
                    />

                    <h2 class="title is-align-self-center">io-technik</h2>
                </div>

                <div class={css.loginBody}>
                    <p class="control has-icons-left has-icons-right">
                        <input type="email"
                            onInput={(e) => setEmail(e.target.value)}
                            class="input is-rounded"
                            placeholder="Correo"
                            required={true}
                        />
                        <span class="icon is-small is-left">
                            <i class="fas fa-envelope" />
                        </span>
                        <span class="icon is-small is-right">
                            <i class="fas fa-check" />
                        </span>
                    </p>

                    <p class="control has-icons-left">
                        <input type="password"
                            onInput={(e) => setPass(e.target.value)}
                            class="input is-rounded"
                            placeholder="Contraseña"
                            required={true}
                        />
                        <span class="icon is-small is-left">
                            <i class="fas fa-lock" />
                        </span>
                    </p>

                    <p class={classNames("control", css['sign-in'])}>
                        <button type="button"
                            onClick={signIn}
                            class="button is-link"
                        >
                            Iniciar Sesión
                        </button>
                    </p>

                </div>
            </div>
        </Show>
    );
}