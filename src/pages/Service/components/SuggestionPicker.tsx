import { createSignal, For, Index, ParentProps, Show } from "solid-js";
import { classNames, windowSize } from "@/utils";
import { createMutable } from "solid-js/store";
import dayjs from "dayjs";

const recomendaciones = [
    "Tapar coladeras",
    "Instalar guardapolvo en puertas",
    "Mantener corto el pasto",
    "Reparar fugas de agua",
    "Recoger alimentos y trastes sucios",
    "Sellar orificios, grietas o hendiduras",
    "No trapear cerca de la pared a 15cm",
    "Instalar mosquiteros",
    "Limpiar derrames en piso y paredes",
    "No dejar alimento de mascota expuesto",
    "Revisión de contenedores de alimento",
    "Almacenar a 15cm del piso y la pared",
    "Utilizar cubre colchón y lavar ropa con agua caliente"
];

/** Generates a unique `id/timestamp` for an img upload */
function getImageId() {
    return "reporte-" + dayjs().format("YYYY-MM-DDTHH:mm:ss");
}

/** Image file extension */
interface ImgFile {
    /** The file blob to be uploaded */
    file: File;
    /** The image extension */
    extension: string;
    /** A unique img id */
    id: string;
}

/** Type for an evidence report */
interface EvidenceReport {
    /** A list of suggestions to fix the found issue */
    suggestions: string[];
    /** The issue encountered during revision */
    problem: string;
    /** Optional report image */
    image?: ImgFile;
}

/** List of finding reports to append to the current service */
const reports = createMutable<EvidenceReport[]>([]);

/** Props for the modal component */
interface ModalProps extends ParentProps {
    /** Action to execute once the modal is closed */
    onClose?: () => void;
    /** If the modal should be shown */
    show: boolean;
}

/** Modal component that displays its children on top of a whole page overlay */
function Modal(props: ModalProps) {
    return (
        <div class={classNames("modal", ["is-active", props.show])}>
            <div class="modal-background" title="Cerrar" onClick={props.onClose} />
            <div class="modal-content" style={{ padding: "2rem" }}>
                <div class="box">
                    {props.children}
                </div>
            </div>
            <button type="button"
                class="modal-close is-large"
                onClick={props.onClose}
                aria-label="close"
            />
        </div>
    )
}

/** Extends the `InputEvent` with its target set to an `HTMLInputElement` */
type FileInputEvent = InputEvent & {
    currentTarget: HTMLInputElement;
    target: HTMLInputElement;
};

/** Component picker to add multiple suggestion reports */
export function SuggestionPicker(_props: any) {
    /** Active report being edited */
    const report = createMutable<EvidenceReport>({
        suggestions: [],
        problem: "",
    });

    /**
     * Handles adding an image file to the reports list
     * @param e An event that has the image payload
     */
    function handleFileUpload(e: FileInputEvent) {
        const { files } = e.target || {};
        if (files?.[0]) {
            const [file] = files;
            report.image = {
                extension: file.type.split("/")[1],
                id: getImageId(),
                file
            };
        }
    }

    /**
     * Updates the selected suggestions field for the currently active report
     * @param options A collection of HTMLOptionElements that will be added to the reports list by value
     */
    function setSuggestions(options: HTMLCollectionOf<HTMLOptionElement>) {
        const selected: string[] = [];
        for (const option of options) {
            selected.push(option.value);
        }

        report.suggestions = selected;
        console.log(selected);
    }

    /**
     * Saves the currently active report to the reports list. Resets the active report to its defaults.
     */
    function saveReport() {
        reports.push({ ...report });
        report.image = undefined;
        report.suggestions = [];
        report.problem = "";
    }

    const [showImg, setShowImg] = createSignal(false);
    const [isShown, setShow] = createSignal(false);
    const toggleModal = (open?: boolean) => setShow(shown => open ?? !shown);
    const isWideScreen = () => windowSize.width > 900;
    const inputHeight = { height: "115px" };

    return (
        <>
            {/* Modal element to show add or modify a report */}
            <Modal show={isShown()} onClose={() => setShow(false)}>
                <form class="form fixed-grid has-3-cols marginless">
                    <div style={{ display: "flex", "align-items": "center" }}>
                        <span class="icon is-left">
                            <i class="fas fa-clipboard fa-lg has-text-info" aria-hidden="true" />
                        </span>
                        <h2 class="title">Recomendación</h2>
                    </div>

                    <div class="file has-name is-boxed is-flex-direction-column">
                        <label class="label">Fotografía</label>
                        <label class="file-label">
                            <input onInput={handleFileUpload} multiple={false} class="file-input" type="file" accept="image/*" />
                            <span class="file-cta" style={{ "border-radius": report.image ? undefined : "6px" }}>
                                <span class="file-icon">
                                    <i class="fas fa-upload"></i>
                                </span>
                                <span class="file-label">
                                    Elige una fotografía
                                </span>
                            </span>

                            <Show when={report.image}>
                                <span style={{ "min-width": "100%" }} class="file-name">
                                    <div style={{ display: "flex", "align-items": "baseline" }}>
                                        <span class="icon is-left">
                                            <i class="fas fa-camera fa-md has-text-info" aria-hidden="true" />
                                        </span>
                                        <span>{report.image?.id}.{report.image?.extension}</span>
                                    </div>
                                </span>
                            </Show>

                        </label>
                    </div>

                    <div class="cell">
                        <label class="label">Problema Detectado</label>
                        <p class="control has-icons-left">
                            <textarea onInput={(e => report.problem = e.target.value)}
                                placeholder="Se encontraron cucarachas en el lavadero..."
                                value={report.problem}
                                class="input"
                                rows={4}
                            />
                            <span class="icon is-medium is-left">
                                <i class="fas fa-info-circle" />
                            </span>
                        </p>
                    </div>

                    <div class="block" />

                    <div class="cell field is-flex-direction-column">
                        <label class="label">Recomendaciones</label>
                        <div style={inputHeight} class={classNames("control is-expanded", ["has-icons-left", isWideScreen()])}>
                            <div class="select is-fullwidth is-multiple">
                                <select onChange={(e => setSuggestions(e.target.selectedOptions))} multiple name="recomendaciones" size="3">
                                    <Index each={recomendaciones}>
                                        {(recomendacion) => (
                                            <option value={recomendacion()}>
                                                {recomendacion()}
                                            </option>
                                        )}
                                    </Index>
                                </select>
                            </div>
                            <Show when={isWideScreen()}>
                                <div class="icon is-small is-left">
                                    <i class="fas fa-bug"></i>
                                </div>
                            </Show>
                        </div>
                    </div>

                    <div class="field marginless is-flex is-justify-content-center">
                        <button style={{ width: "45%" }}
                            class="column button"
                            type="button"
                            onClick={() => {
                                toggleModal(false);
                                saveReport();
                            }}
                        >
                            <span>Guardar</span>
                            <span class="icon">
                                <i class="fas fa-circle-plus"></i>
                            </span>
                        </button>
                        <button style={{ width: "45%" }}
                            onClick={() => toggleModal()}
                            class="column button"
                            type="button"
                        >
                            <span>Cancelar</span>
                            <span class="icon">
                                <i class="fas fa-xmark"></i>
                            </span>
                        </button>
                    </div>

                </form>
            </Modal>

            {/* List that shows the added reports, allows deleting and editing */}
            <Show when={reports.length > 0}>
                <h2 class="subtitle">Recomendaciones</h2>
                <div class="box">
                    <table class="table" style={{ width: "100%" }}>
                        <thead>
                            <tr>
                                <th>Problema</th>
                                <th>Recomendación</th>
                                <th>Foto</th>
                                <th>Editar</th>
                                <th>Borrar</th>
                            </tr>
                        </thead>

                        <tbody>
                            <For each={reports}>
                                {(report, index) => (
                                    <tr>
                                        <td>{report.problem}</td>
                                        <td>
                                            <ol>
                                                <Index each={report.suggestions}>
                                                    {(suggestion) => (
                                                        <li>{suggestion()}</li>
                                                    )}
                                                </Index>

                                            </ol>
                                        </td>

                                        <td>
                                            <div class="has-text-link"
                                                onClick={() => setShowImg(true)}
                                                style={{ cursor: "pointer" }}
                                            >
                                                {report.image?.id ?? "N/A"}
                                            </div>
                                            <Show when={report.image && showImg()}>
                                                <Modal show={true} onClose={() => setShowImg(false)}>
                                                    <div class="box">
                                                        <img alt={report.image!.id + " preview"}
                                                            src={URL.createObjectURL(report.image!.file)}
                                                        />
                                                        
                                                        <button type="button" onClick={() => setShowImg(false)}>
                                                            Cerrar
                                                        </button>
                                                    </div>
                                                </Modal>
                                            </Show>
                                        </td>

                                        <td>
                                            <a title="Editar" href="#">
                                                <span class="icon is-left">
                                                    <i class="fas fa-edit fa-lg has-text-primary" aria-hidden="true" />
                                                </span>
                                            </a>

                                        </td>
                                        <td>
                                            <a title="Borrar" href="#" onClick={() => reports.splice(index(), 1)}>
                                                <span class="icon is-left">
                                                    <i class="fas fa-trash-can fa-lg has-text-info" aria-hidden="true" />
                                                </span>
                                            </a>
                                        </td>
                                    </tr>
                                )}
                            </For>
                        </tbody>
                    </table>
                </div>
            </Show>

            {/* Button to add a new report */}
            <div class="field is-grouped is-justify-content-center marginless">
                <div class="control">
                    <button type="button" class="button" onClick={() => toggleModal()}>
                        <span>Agregar otra recomendación</span>
                        <span class="icon">
                            <i class="fas fa-circle-plus"></i>
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
}