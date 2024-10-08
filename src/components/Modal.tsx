import { classNames } from "@/utils";
import { ParentProps } from "solid-js";

/** Props for the modal component */
export interface ModalProps extends ParentProps {
    /** Action to execute once the modal is closed */
    onClose?: () => void;
    /** If the modal should be shown */
    show: boolean;
}

/** Modal component that displays its children on top of a whole page overlay */
export function Modal(p: ModalProps) {
    return (
        <div class={classNames("modal", ["is-active", p.show])}>
            <div class="modal-background" title="Cerrar" onClick={p.onClose} />
            <div class="modal-content" style={{ padding: "1rem", "max-height": "95vh" }}>
                <div class="box">
                    {p.children}
                </div>
            </div>
        </div>
    )
}