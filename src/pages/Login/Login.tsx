import insectsImg from "@/assets/insects-out-med.png";
import { Auth, currentSession } from "@/supabase";
import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal } from "solid-js";
import { Pages } from "..";

const [email, setEmail] = createSignal("");
const [pass, setPass] = createSignal("");

export function Login() {
    const navigate = useNavigate();

    function signIn(): Promise<string> {
        return Auth
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
    }

    createEffect(() => {
        if (currentSession()) {
            navigate(Pages.Home);
        }
    })

    return (
        <div class="field is-grouped is-flex-direction-column">
            <figure class="image is-align-self-center">
                <img width={225} height={225}
                    alt="Logo de Insects Out"
                    src={insectsImg}
                />
            </figure>

            <h2 class="title is-align-self-center">io-technik</h2>

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

            <p class="control is-align-self-center">
                <button type="button"
                    onClick={signIn}
                    class="button is-link"
                >
                    Iniciar Sesión
                </button>
            </p>
        </div>
    );
}