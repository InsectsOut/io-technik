import { createSignal, createUniqueId, For } from "solid-js";
import { classNames, SlideDownFadeIn } from "@/utils";
import { Motion } from "solid-motionone";

import css from "./Toast.module.css";
import { TiTimes } from "solid-icons/ti";

export type ToastData = { id: string; message: string; type: string };
export type ToastType = "is-primary" | "is-link" | "is-info" | "is-success" | "is-warning" | "is-danger";

const [toasts, setToasts] = createSignal<ToastData[]>([]);

function addToast(message: string, type: ToastType) {
    const id = createUniqueId();
    setToasts(t => [...t, { id, message, type }]);

    // Auto-remove after 3.5 seconds
    setTimeout(() => removeToast(id), 3500);
}

function removeToast(id: string) {
    const toast = document.getElementById(id);
    // Fades out the toast when cleared
    const animation = toast?.animate(
        [
            { opacity: 1 }, // Starting state
            { opacity: 0 }, // Ending state
        ],
        {
            duration: 300, // Duration in ms
            easing: 'ease-in-out', // Easing function
        }
    );

    if (animation) animation.onfinish = () => {
        setToasts(t => t.filter(t => t.id !== id));
    };
}

export function useToast() {
    return { toasts, addToast, removeToast };
}

export function Toast(p: { toasts: ToastData[] }) {
    return (
        <div class={css.toast}>
            <For each={p.toasts}>
                {(toast) => (
                    <Motion.div {...SlideDownFadeIn} class={`notification ${toast.type}`} id={toast.id}>
                        {toast.message}
                        <span
                            class={classNames("icon is-small is-pointer", css.toast_icon)}
                            onClick={() => removeToast(toast.id)}
                            title="Cerrar"
                        >
                            <TiTimes class="is-size-5" />
                        </span>
                    </Motion.div>
                )}
            </For>
        </div>
    );
}
