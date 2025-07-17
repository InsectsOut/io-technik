import insectsImg from "@/assets/insects-out-med.png";
import { Auth, currentSession, Logger } from "@/supabase";
import { useLocation, useNavigate } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";

import { useToast } from "@/components";
import { classNames } from "@/utils";

import css from "./Login.module.css";
import { FaSolidCheck, FaSolidEnvelope, FaSolidLock } from "solid-icons/fa";

const [email, setEmail] = createSignal("");
const [pass, setPass] = createSignal("");

export function Login() {
    const location = useLocation<{ from: string }>();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const signIn = (): Promise<string> => Auth
        .signIn(email(), pass())
        .then(({ data, error }) => {
            if (!data.user || error) {
                addToast("Correo o contraseña incorrecta", "is-warning");
            } else {
                navigate("/home", { replace: true });
            }
        })
        .catch(err => Logger.write({ message: err.message, severity: "Low", type: "Auth" }))
        .then(() => "Sesión iniciada");

    createEffect(() => {
        if (currentSession()) {
            // After successful login, redirect to the original intended destination
            const { from = "/login" } = location.state || {};
            const page = from === "/login" ? "/home" : from;
            navigate(page, { replace: true });
        }
    });

    const formClass = classNames(
        "field is-grouped",
        "is-flex-direction-column",
        css.loginForm
    );

    return (
        <Show when={!currentSession()}>
            <div class={formClass}>

                <div class={css.loginHead}>
                    <img width={225} height={225}
                        alt="Logo de Insects Out"
                        src={insectsImg}
                        loading="lazy"
                    />

                    <h2 class="title is-align-self-center">io-technik</h2>
                </div>

                <form class={css.loginBody} onKeyDown={(e) => e.key === "Enter" && signIn()}>
                    <p class="control has-icons-left has-icons-right">
                        <input type="email"
                            onInput={(e) => setEmail(e.target.value)}
                            class="input is-rounded"
                            placeholder="Correo"
                            required={true}
                        />
                        <span class="icon is-small is-left">
                            <FaSolidEnvelope />
                        </span>
                        <span class="icon is-small is-right">
                            <FaSolidCheck />
                        </span>
                    </p>

                    <p class="control has-icons-left">
                        <input type="password"
                            onInput={(e) => setPass(e.target.value)}
                            class="input is-rounded"
                            placeholder="Contraseña"
                            autocomplete="on"
                            required={true}
                        />
                        <span class="icon is-small is-left">
                            <FaSolidLock />
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

                </form>
            </div>
        </Show>
    );
}