import { classNames } from "../utils/CssHelpers";
import { Show, createSignal } from "solid-js";

import "./Navbar.module.css";
import { A, useBeforeLeave } from "@solidjs/router";
import { Auth, currentSession } from "@/supabase";
import { employeeProfile } from "@/state/Profile";
import { Pages } from "@/pages";
import { AiFillHome } from "solid-icons/ai";

export function Navbar() {
    const [isMenuActive, setMenuActive] = createSignal(false);
    const toggleMenu = () => setMenuActive(!isMenuActive());
    const closeMenu = () => {
        setMenuActive(false);
    };

    /** Classname for the navbar-burger element */
    const navbarBurgerClass = () => classNames(
        "navbar-burger js-burger",
        ["is-active", isMenuActive()]
    );

    /** Closes the current user session */
    function closeSession() {
        Auth.signOut().then(closeMenu);
    }

    /** Classname for the navbar-menu element */
    const navbarMenuClass = () => classNames(
        "navbar-menu", ["is-active", isMenuActive()]
    );

    /** Close the dropdown menu on navigation */
    useBeforeLeave(closeMenu);

    return (
        <Show when={currentSession()}>
            <nav class="navbar is-transparent">
                <div class="navbar-brand">
                    <A href={Pages.Home} class="panel-block is-active has-text-link">
                        <span class="icon mr-1">
                            <AiFillHome class="is-size-5" />
                        </span>
                        insects-out
                    </A>

                    <div class={navbarBurgerClass()}
                        data-target="navbar-element"
                        onClick={toggleMenu}
                    >
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>
                </div>

                <div id="navbar-element" class={navbarMenuClass()}>
                    <div class="navbar-start">
                        <Show when={currentSession()}>
                            <A href="/user" class="navbar-item">
                                {employeeProfile()?.nombre}
                            </A>
                            <A href="/feedback" class="navbar-item">
                                Reporta un problema
                            </A>
                            <hr class="navbar-divider" />
                            <A href="/about" class="navbar-item">
                                Información
                            </A>
                        </Show>
                    </div>

                    <div class="navbar-end">
                        <div class="navbar-item">
                            <div class="buttons is-justify-content-end">
                                <button type="button" onClick={closeSession} class="button is-link">
                                    <strong>Cerrar sesión</strong>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </Show>
    );
}