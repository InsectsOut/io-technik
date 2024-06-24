import { classNames } from "../utils/CssHelpers";
import { Show, createSignal } from "solid-js";

import "./Navbar.module.css";
import { userStore as user } from "@/state/User";
import { A, useBeforeLeave } from "@solidjs/router";
import { session } from "@/supabase";

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

    /** Classname for the navbar-menu element */
    const navbarMenuClass = () => classNames(
        "navbar-menu", ["is-active", isMenuActive()]
    );

    const navbarDropdownClass = () => classNames(
        "navbar-item has-dropdown is-hoverable",
        ["dropdown-expand", isDropActive()],
        ["is-selected", isDropActive()],
        ["is-active", isDropActive()],
    );

    /** Close the dropdown menu on navigation */
    useBeforeLeave(() => {
        closeMenu();
    });

    return (
        <nav class="navbar is-transparent is-fixed-top">
            <div class="navbar-brand">
                <a href="/home" class="has-text-link navbar-item">
                    insects-out
                </a>

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
                    <Show when={session()}>
                        <A href="/user" class="has-text-link navbar-item">
                            {user.firstname} {user.lastname}
                        </A>
                    </Show>

                    <a class="navbar-item" href="/home">Inicio</a>
                    <div class={navbarDropdownClass()}>
                        <a class="navbar-link" onClick={toggleDrop}>Más</a>
                        <Show when={isDropActive()}>
                            <div class="navbar-dropdown is-boxed is-hoverable">
                                <a href="/about" class="navbar-item"> Información </a>
                                <a class="navbar-item"> Contacto </a>
                                <hr class="navbar-divider" />
                                <a class="navbar-item"> Reporta un problema </a>
                            </div>
                        </Show>
                    </div>
                </div>

                <div class="navbar-end">
                    <div class="navbar-item">
                        <div class="buttons is-centered">
                            <a class="button is-link">
                                <strong>Registrarse</strong>
                            </a>
                            <a href="/login" class="button is-light">
                                Iniciar sesión
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}