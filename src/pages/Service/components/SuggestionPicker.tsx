import { createMutable } from "solid-js/store";
import { For, Index, Show } from "solid-js";

import { classNames, ImgFile, windowSize } from "@/utils";
import { Modal } from "@/components";
import { getImageId } from "../Service.utils"

/** Tipo para una sugerencia de servicio */
type Sugerencia = {
    /** Recomendaciones de esta sugerencia */
    recomendaciones: string[];
    /** Problema encontrado en el servicio */
    problema: string;
    /** Imagen opcional adjunta al reporte */
    imagen?: ImgFile;
}

/** Extends the `InputEvent` with its target set to an `HTMLInputElement` */
type FileInputEvent = InputEvent & {
    currentTarget: HTMLInputElement;
    target: HTMLInputElement;
};

/** Lista de sugerencias para un reporte de servicio */
const sugerencias = createMutable<Sugerencia[]>([]);

/** Reactive state for the suggestions picker component */
const picker = createMutable({
    showModal: false,
    showImg: false
});

/** Recomendaciones para una sugerencia de servicio */
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

/**
 * Render function for a suggestion entry
 * @param report The report to be rendered
 * @param index The index for the report
 * @returns A JSX rendered suggestion entry
 */
function SuggestionEntry(report: Sugerencia, index: number) {
    return (
        <>
            <tr>
                <td>{report.problema}</td>
                <td>
                    <ol>
                        <Index each={report.recomendaciones}>
                            {(suggestion) => (
                                <li>{suggestion()}</li>
                            )}
                        </Index>

                    </ol>
                </td>

                <Show when={windowSize.width > 550}>
                    <td>
                        <div class="has-text-link"
                            onClick={() => picker.showImg = true}
                            style={{ cursor: "pointer" }}
                        >
                            {report.imagen?.id ?? "N/A"}
                        </div>
                        <Show when={report.imagen && picker.showImg}>
                            <Modal show={true} onClose={() => picker.showImg = false}>
                                <div class="box">
                                    <img alt={`${report.imagen!.id} preview`}
                                        src={URL.createObjectURL(report.imagen!.file)}
                                    />

                                    <button type="button" onClick={() => picker.showImg = false}>
                                        Cerrar
                                    </button>
                                </div>
                            </Modal>
                        </Show>
                    </td>

                    <td>
                        <a title="Editar" href="#">
                            <span class="icon is-left">
                                <i class="fas fa-edit fa-lg has-text-warning" aria-hidden="true" />
                            </span>
                        </a>

                    </td>

                    <td>
                        <a title="Borrar" href="#" onClick={() => sugerencias.splice(index, 1)}>
                            <span class="icon is-left">
                                <i class="fas fa-trash-can fa-lg has-text-danger" aria-hidden="true" />
                            </span>
                        </a>
                    </td>
                </Show>
            </tr>

            <Show when={windowSize.width <= 550}>
                <tr>
                    <td colSpan={3}>
                        <div class="is-flex is-justify-content-space-around">
                            <a title="Editar" href="#">
                                <span class="icon is-left">
                                    <i class="fas fa-edit fa-lg has-text-warning" aria-hidden="true" />
                                </span>
                            </a>

                            <a title="Borrar" href="#" onClick={() => sugerencias.splice(index, 1)}>
                                <span class="icon is-left">
                                    <i class="fas fa-trash-can fa-lg has-text-danger" aria-hidden="true" />
                                </span>
                            </a>

                            <a title="Foto" href="#" onClick={() => picker.showImg = true}>
                                <span class="icon is-left">
                                    <i class={classNames("fas fa-lg has-text-info",
                                        report.imagen ? "fa-image" : "fa-circle-xmark",
                                    )}
                                        aria-hidden="true"
                                    />
                                </span>
                            </a>
                        </div>

                        <Show when={report.imagen && picker.showImg}>
                            <Modal show={true} onClose={() => picker.showImg = false}>
                                <div class="box">
                                    <img alt={`${report.imagen!.id} preview`}
                                        src={URL.createObjectURL(report.imagen!.file)}
                                    />

                                    <button type="button" onClick={() => picker.showImg = false}>
                                        Cerrar
                                    </button>
                                </div>
                            </Modal>
                        </Show>
                    </td>
                </tr>
            </Show>
        </>
    );
}

/** Component picker to add multiple suggestion reports */
export function SuggestionPicker() {
    /** Active report being edited */
    const report = createMutable<Sugerencia>({
        recomendaciones: [],
        problema: "",
    });

    /**
     * Handles adding an image file to the reports list
     * @param e An event that has the image payload
     */
    function handleFileUpload(e: FileInputEvent) {
        const { files } = e.target || {};
        if (files?.[0]) {
            const [file] = files;
            report.imagen = {
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

        report.recomendaciones = selected;
    }

    /**
     * Saves the currently active report to the reports list. Resets the active report to its defaults.
     */
    function saveReport() {
        sugerencias.push({ ...report });
        clearReportForm();
    }

    /** Clears the report form fields and unselects all suggestion options */
    function clearReportForm() {
        report.imagen = undefined;
        report.recomendaciones = [];
        report.problema = "";

        if (!suggestionsRef) {
            return;
        }

        for (const option of suggestionsRef.options) {
            option.selected = false;
        }
    }

    let suggestionsRef: HTMLSelectElement | undefined;
    const isWideScreen = () => windowSize.width > 900;
    const inputHeight = { height: "115px" };

    return (
        <>
            {/* Modal element to show add or modify a report */}
            <Modal show={picker.showModal} onClose={() => picker.showModal = false}>
                <form class="form fixed-grid has-3-cols marginless paddingless">
                    <div style={{ display: "flex", "align-items": "center" }}>
                        <h2 class="subtitle marginless" style={{ "padding-left": 0 }}>
                            Nueva Recomendación
                        </h2>
                        <span class="icon is-left">
                            <i class="fas fa-edit fa-lg has-text-info" aria-hidden="true" />
                        </span>
                    </div>

                    <div style={{ overflow: "scroll" }}>
                        <div class="file has-name is-boxed is-flex-direction-column">
                            <label class="label">Fotografía</label>
                            <label class="file-label">
                                <input onInput={handleFileUpload} multiple={false} class="file-input" type="file" accept="image/*" />
                                <span class="file-cta" style={{ "border-radius": report.imagen ? undefined : "6px" }}>
                                    <span class="file-icon">
                                        <i class="fas fa-upload" />
                                    </span>
                                    <span class="file-label">
                                        Elige una fotografía
                                    </span>
                                </span>

                                <Show when={report.imagen}>
                                    <span style={{ "min-width": "100%" }} class="file-name">
                                        <div style={{ display: "flex", "align-items": "baseline" }}>
                                            <span class="icon is-left">
                                                <i class="fas fa-camera fa-md has-text-info" aria-hidden="true" />
                                            </span>
                                            <span>{report.imagen?.id}.{report.imagen?.extension}</span>
                                        </div>
                                    </span>
                                </Show>

                            </label>
                        </div>

                        <div class="cell">
                            <label class="label">Problema Detectado</label>
                            <p class="control has-icons-left">
                                <textarea onInput={(e => report.problema = e.target.value)}
                                    placeholder="Se encontraron cucarachas en el lavadero..."
                                    value={report.problema}
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
                                    <select ref={suggestionsRef}
                                        onChange={(e => setSuggestions(e.target.selectedOptions))}
                                        multiple name="recomendaciones" size="3"
                                        required
                                    >
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
                                        <i class="fas fa-bug" />
                                    </div>
                                </Show>
                            </div>
                        </div>

                        <div class="field marginless is-flex is-justify-content-center">
                            <button style={{ width: "45%" }}
                                class="column button"
                                type="button"
                                onClick={() => {
                                    picker.showModal = false;
                                    saveReport();
                                }}
                            >
                                <span>Guardar</span>
                                <span class="icon">
                                    <i class="fas fa-circle-plus" />
                                </span>
                            </button>
                            <button style={{ width: "45%" }}
                                onClick={() => picker.showModal = false}
                                class="column button"
                                type="button"
                            >
                                <span>Cancelar</span>
                                <span class="icon">
                                    <i class="fas fa-xmark" />
                                </span>
                            </button>
                        </div>
                    </div>


                </form>
            </Modal>

            {/* List that shows the added reports, allows deleting and editing */}
            <Show when={sugerencias.length > 0}>
                <h2 class="subtitle no-pad-left is-marginless">Recomendaciones</h2>
                <div class="table-container">
                    <table class="table is-striped" style={{ width: "100%" }}>
                        <thead>
                            <tr>
                                <th>Problema</th>
                                <th>Recomendaciones</th>
                                <Show when={windowSize.width > 550}>
                                    <th>Foto</th>
                                    <th>Editar</th>
                                    <th>Borrar</th>
                                </Show>
                            </tr>
                        </thead>

                        <tbody>
                            <For each={sugerencias}>
                                {(report, index) => SuggestionEntry(report, index())}
                            </For>
                        </tbody>
                    </table>
                </div>
            </Show>

            {/* Button to add a new report */}
            <div class="field is-grouped is-justify-content-center marginless">
                <div class="control">
                    <button type="button" class="button" onClick={() => picker.showModal = true}>
                        <span>Nueva recomendación</span>
                        <span class="icon">
                            <i class="fas fa-circle-plus" />
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
}