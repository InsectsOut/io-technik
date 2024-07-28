import { classNames } from "../utils/CssHelpers";
import { Show, createSignal } from "solid-js";

import "./Navbar.module.css";
import { userStore as user } from "@/state/User";
import { A, useBeforeLeave } from "@solidjs/router";
import { Auth, currentSession } from "@/supabase";

export function Navbar() {
    const [isMenuActive, setMenuActive] = createSignal(false);
    const [isDropActive, setDropActive] = createSignal(false);
    const toggleMenu = () => setMenuActive(!isMenuActive());
    const toggleDrop = () => setDropActive(!isDropActive());
    const closeMenu = () => {
        setMenuActive(false);
        setDropActive(false);
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

    /** Classname for the navbar-dropdown */
    const navbarDropdownClass = () => classNames(
        "navbar-item has-dropdown is-hoverable",
        ["dropdown-expand", isDropActive()],
        ["is-selected", isDropActive()],
        ["is-active", isDropActive()],
    );

    /** Close the dropdown menu on navigation */
    useBeforeLeave(() => closeMenu());

    return (
        <Show when={currentSession()}>
            <nav class="navbar is-transparent">
                <div class="navbar-brand">
                    <A href="/home" class="has-text-link navbar-item">
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
                            <A href="/user" class="has-text-link navbar-item">
                                {user.firstname} {user.lastname}
                            </A>
                        </Show>

                        <div class={navbarDropdownClass()}>
                            <div class="has-text-weight-semibold navbar-link" onClick={toggleDrop}>Más</div>
                            <Show when={isDropActive()}>
                                <div class="navbar-dropdown is-boxed is-hoverable">
                                    <A href="/about" class="navbar-item">
                                        Información
                                    </A>
                                    <hr class="navbar-divider" />
                                    <A href="/feedback" class="navbar-item">
                                        Reporta un problema
                                    </A>
                                </div>
                            </Show>
                        </div>
                    </div>

                    <div class="navbar-end">
                        <div class="navbar-item">
                            <div class="buttons is-centered">
                                <button onClick={closeSession} class="button is-link">
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