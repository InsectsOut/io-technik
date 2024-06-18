import { classNames } from "../utils/CssHelpers";
import { Show, createSignal } from "solid-js";

import "./Navbar.module.css";
import { userStore as user } from "../state/User"

export function Navbar() {
    const [isMenuActive, setMenuActive] = createSignal(false);
    const [isDropActive, setDropActive] = createSignal(false);
    const closeMenu = () => setMenuActive(false);
    const toggleMenu = () => setMenuActive(!isMenuActive());
    const toggleDrop = () => setDropActive(!isDropActive());

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

    return (
        <nav class="navbar is-transparent is-fixed-top">
            <div class="navbar-brand">
                <a onClick={closeMenu} href="/" class="has-text-link navbar-item">
                    insects-out
                </a>
                <div class="has-text-link navbar-item">{user.firstname} {user.lastname}</div>
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
                    <a onClick={closeMenu} class="navbar-item" href="/home">Inicio</a>
                    <div class={navbarDropdownClass()}>
                        <a class="navbar-link" onClick={toggleDrop}>Más</a>
                        <Show when={isDropActive()}>
                            <div class="navbar-dropdown is-boxed is-hoverable">
                                <a onClick={closeMenu} href="/about" class="navbar-item"> Información </a>
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
                            <a class="button is-light">
                                Iniciar sesión
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}