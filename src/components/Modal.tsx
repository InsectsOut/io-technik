import { onCleanup, onMount, ParentProps } from "solid-js";
import { classNames } from "@/utils";

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

    return (
        <div class={classNames("modal", ["is-active", p.show])}>
            <div class="modal-background" title="Cerrar" onClick={p.onClose} />
            <div class="modal-content"
                style={{
                    "max-height": "95vh",
                    "max-width": "95vw",
                }}
            >
                <div class="box">
                    {p.children}
                </div>
            </div>
        </div>
    )
}