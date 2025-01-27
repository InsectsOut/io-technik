import { createEffect, onCleanup, onMount, ParentProps, Show } from "solid-js";
import { classNames, SlideDown } from "@/utils";
import { setCanSwipe } from "@/pages";
import { Motion } from "solid-motionone";

import "./Modal.css";

/** Props for the modal component */
export interface ModalProps extends ParentProps {
    /** Action to execute once the modal is closed */
    onClose?: () => void;
    /** If the modal should be shown */
    show: boolean;
}

/** Modal component that displays its children on top of a whole page overlay */
export function Modal(p: ModalProps) {
    // Execute the onClose callback on ESC press
    function escHandler(e: KeyboardEvent) {
        if (e.key === "Escape") {
            p.onClose?.();
        }
    }

    onMount(() => document.addEventListener("keydown", escHandler));
    onCleanup(() => document.removeEventListener("keydown", escHandler));
    createEffect(() => setCanSwipe(!p.show));

    return (
        <div class={classNames("modal", ["is-active", p.show])}>
            <div class="modal-background" title="Cerrar" onClick={p.onClose} />
            <div class="modal-content mb-6">
                <Show when={p.show} keyed={true}>
                    <Motion.div class="box is-flex is-flex-direction-column p-4 is-shadowless"
                        {...SlideDown}
                    >
                        {p.children}
                    </Motion.div>
                </Show>
            </div>
        </div>
    )
}