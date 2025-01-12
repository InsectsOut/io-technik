import { createMutable, createStore } from "solid-js/store";
import { createEffect, createSignal, For, Index, onCleanup, onMount, Show } from "solid-js";

import { classNames, getFileExtension, windowSize } from "@/utils";
import { getImageId } from "../Service.utils"
import { Recomendacion } from "../Service.types";
import { Modal } from "@/components";
import { AccionesRecomendadas } from "./Suggestion.constants";
import { createQuery } from "@tanstack/solid-query";
import { getRecomendaciones } from "./Suggestion.query";
import { IO_Database, supabase } from "@/supabase";
import { BsPencilSquare } from "solid-icons/bs";
import { FaRegularEyeSlash, FaRegularImage, FaSolidBug, FaSolidCamera, FaSolidCircleInfo, FaSolidCirclePlus, FaSolidTrashCan, FaSolidUpload, FaSolidXmark } from "solid-icons/fa";

/** Extends the `InputEvent` with its target set to an `HTMLInputElement` */
type FileInputEvent = InputEvent & {
    currentTarget: HTMLInputElement;
    target: HTMLInputElement;
};

/** Props for the suggestion picker component */
type PickerProps = {
    /** Id for a service to fetch its recommendations */
    servicioId: number;
    /** Callback that exposes the suggestions array on change */
    onSuggestionAdd: (suggestions: Recomendacion[]) => void;
};

/** Component picker to add multiple suggestion reports */
export function SuggestionPicker(props: PickerProps) {
    const recomendacionesQuery = createQuery(() => ({
        queryKey: [`recomendaciones/${props.servicioId}`],
        queryFn: () => getRecomendaciones(props.servicioId.toString()),
        throwOnError: false
    }));

    /** Lista de sugerencias para un reporte de servicio */
    const [sugerencias, setSugerencias] = createStore<Recomendacion[]>([]);

    let suggestionsRef: HTMLSelectElement | undefined;
    const isWideScreen = () => windowSize.width > 900;
    const inputHeight = { height: "115px" };

    // Load the suggestions from the DB and maps them to the local state
    createEffect(() => {
        const loadedData = recomendacionesQuery.data;

        if (!loadedData) {
            return;
        }

        // Maps the loaded data to the local state, including the image file
        const mappedEntries = loadedData.map(async item => {
            const { data } = await supabase.storage
                .from("imagenes_servicios")
                .download(item.imagen ?? "")
                .catch(_ => ({ data: null }));

            const hasImage = Boolean(item.imagen && data);
            const imgFile = hasImage
                ? new File([data!], item.imagen!, { type: data!.type })
                : undefined;

            return {
                id: item.id.toString(),
                acciones: item.acciones,
                problema: item.problema,
                imagen: {
                    extension: getFileExtension(item.imagen ?? ""),
                    id: item.imagen ?? "",
                    file: imgFile
                }
            } as Recomendacion;
        });

        if (mappedEntries) {
            Promise.all(mappedEntries).then(r => {
                setSugerencias(r);
            });
        }
    });

    /** Deletes a suggestion locally if not upload, and removes it from the DB if uploaded */
    async function deleteSuggestion(index: number): Promise<any> {
        const sugerencia = sugerencias[index];
        if (!sugerencia.id) {
            return setSugerencias(sugerencias.filter((_, i) => i !== index));
        }

        const deleted = await IO_Database
            .from("Recomendaciones")
            .delete().eq("id", sugerencia.id);

        const imageDeleted = await supabase.storage
            .from("imagenes_servicios")
            .remove([sugerencia.imagen?.id ?? ""]);

        if (deleted?.error === null) {
            recomendacionesQuery.refetch();
            setSugerencias(sugerencias.filter((_, i) => i !== index));
            console.log(deleted, imageDeleted);
        }
    }

    /** Reactive state for the suggestions picker component */
    const picker = createMutable({
        editIndex: NaN,
        isEditing: false,
        showModal: false
    });

    /** Active report being edited */
    const report = createMutable<Recomendacion>({
        acciones: [],
        problema: "",
    });

    /**
     * Render function for a suggestion entry
     * @param entry The report to be rendered
     * @param index The index for the report
     * @returns A JSX rendered suggestion entry
    */
    function SuggestionEntry(entry: Recomendacion, index: number) {
        const [showPreview, setShowPreview] = createSignal(false);
        const [imgPreview, setImgPreview] = createSignal("");

        createEffect(() => {
            if (entry.imagen && showPreview()) {
                // Set the image preview to the object URL when the image is shown
                setImgPreview(URL.createObjectURL(entry.imagen.file));
            }

            // Cleanup the object URL when the component is unmounted
            return () => URL.revokeObjectURL(imgPreview());
        });

        return (
            <>
                <tr>
                    <td>{entry.problema}</td>
                    <td>
                        <ol>
                            <Index each={entry.acciones}>
                                {(suggestion) => (
                                    <li>{suggestion()}</li>
                                )}
                            </Index>
                        </ol>
                    </td>

                    <Show when={windowSize.width > 550}>
                        <td>
                            <div class="has-text-link"
                                onClick={() => entry.imagen && setShowPreview(true)}
                                style={{ cursor: "pointer" }}
                            >
                                {entry.imagen?.id ?? "N/A"}
                            </div>
                            <Show when={entry.imagen && showPreview()}>
                                <Modal show={true} onClose={() => setShowPreview(false)}>
                                    <img alt={`${entry.imagen!.id} preview`}
                                        src={imgPreview()}
                                    />

                                    <button type="button" onClick={() => setShowPreview(false)}>
                                        Cerrar
                                    </button>
                                </Modal>
                            </Show>
                        </td>

                        <td class="has-text-centered">
                            <div title="Editar" onClick={() => editSugerencia(index)}>
                                <span class="icon is-left is-clickable">
                                    <BsPencilSquare class="is-size-4 has-text-warning" aria-hidden="true" />
                                </span>
                            </div>

                        </td>

                        <td class="has-text-centered">
                            <div title="Borrar" onClick={() => deleteSuggestion(index)}>
                                <span class="icon is-left is-clickable">
                                    <FaSolidTrashCan class="is-size-5 has-text-danger" aria-hidden="true" />
                                </span>
                            </div>
                        </td>
                    </Show>
                </tr>

                <Show when={windowSize.width <= 550}>
                    <tr>
                        <td colSpan={3}>
                            <div class="is-flex is-justify-content-space-around">
                                <div title="Editar" onClick={() => editSugerencia(index)} tabIndex={0}>
                                    <span class="icon is-left is-clickable" aria-label="Editar">
                                        <BsPencilSquare class="is-size-4 has-text-warning" />
                                    </span>
                                </div>

                                <div title="Borrar" onClick={() => deleteSuggestion(index)} tabIndex={0}>
                                    <span class="icon is-left is-clickable" aria-label="Borrar">
                                        <FaSolidTrashCan class="is-size-5 has-text-danger" />
                                    </span>
                                </div>

                                <div title="Foto" onClick={() => setShowPreview(true)} tabIndex={0}>
                                    <span class="icon is-left is-clickable" aria-label="Imagen">
                                        {entry.imagen
                                            ? <FaRegularImage class="has-text-info is-size-4" />
                                            : <FaRegularEyeSlash class="has-text-grey is-size-4" />
                                        }
                                    </span>
                                </div>
                            </div>

                            <Show when={entry.imagen && showPreview()}>
                                <Modal show={true} onClose={() => setShowPreview(false)}>
                                    <img alt={`${entry.imagen!.id} preview`}
                                        src={imgPreview()}
                                    />

                                    <button
                                        onClick={() => setShowPreview(false)}
                                        style={{ "margin-top": "1rem", width: "100%" }}
                                        class="button"
                                        type="button"
                                    >
                                        Cerrar
                                    </button>
                                </Modal>
                            </Show>
                        </td>
                    </tr>
                </Show>
            </>
        );
    }

    /**
     * Handles adding an image file to the reports list
     * @param e An event that has the image payload
     */
    function handleFileUpload(e: FileInputEvent) {
        const { files } = e.target || {};
        const [file] = files || [];
        if (!file) return;

        report.imagen = {
            extension: file.type.split("/")[1],
            id: getImageId(),
            file
        };
    }

    /**
     * Updates the selected suggestions field for the currently active report
     * @param options A collection of HTMLOptionElements that will be added to the reports list by value
     */
    function setActions(options: HTMLCollectionOf<HTMLOptionElement>) {
        const selected: string[] = [];
        for (const option of options) {
            selected.push(option.value);
        }

        report.acciones = selected;
    }

    /**
     * Updates the active report with the selected suggestion and opens the modal
     * @param index The index of the suggestion to edit
     */
    function editSugerencia(index: number) {
        const sugerencia = sugerencias[index];
        report.problema = sugerencia.problema;
        report.acciones = sugerencia.acciones;
        report.imagen = sugerencia.imagen;

        if (suggestionsRef) {
            // Wait for the next frame to select the options in the report
            window.requestAnimationFrame(() => {
                for (const accion of report.acciones) {
                    const option = suggestionsRef.querySelector(`option[value="${accion}"]`);
                    if (option instanceof HTMLOptionElement) {
                        option.selected = true;
                    }
                }
            });
        }

        picker.showModal = true;
        picker.isEditing = true;
        picker.editIndex = index;
    }

    /**
     * Saves the currently active report to the reports list. Resets the active report to its defaults.
     */
    function saveReport() {
        if (picker.isEditing) {
            const editIndex = picker.editIndex;
            picker.isEditing = false;
            picker.editIndex = NaN;

            if (sugerencias[editIndex]) {
                setSugerencias(editIndex, { ...report });
            }
        } else {
            setSugerencias(sugerencias.length, { ...report });
        }

        clearReportForm();
    }

    /** Clears the report form fields and unselects all suggestion options */
    function clearReportForm() {
        report.imagen = undefined;
        report.acciones = [];
        report.problema = "";

        if (!suggestionsRef) {
            return;
        }

        for (const option of suggestionsRef.options) {
            option.selected = false;
        }
    }

    function handleEnterKey(e: KeyboardEvent) {
        if (e.key === "Enter") {
            picker.showModal = false;
            saveReport();
        }
    }

    // Save the report on Enter keydown event
    onMount(() => document.addEventListener("keydown", handleEnterKey));
    onCleanup(() => document.removeEventListener("keydown", handleEnterKey));

    createEffect(() => {
        // Every time the suggestions list changes, update the parent component
        props.onSuggestionAdd(sugerencias);
    });

    return (
        <>
            {/* Modal element to show add or modify a report */}
            <Modal show={picker.showModal} onClose={() => {
                picker.showModal = false;
                clearReportForm();
            }}>
                <form class="form fixed-grid has-3-cols marginless paddingless" style={{ height: "auto" }}>
                    <div class="is-flex is-justify-content-space-between">
                        <h2 class="subtitle pl-0">
                            Nueva Recomendación
                        </h2>
                        <span class="icon is-left">
                            <BsPencilSquare class="is-size-4 has-text-info" aria-hidden="true" />
                        </span>
                    </div>

                    <div style={{ overflow: "auto" }}>
                        <div class="file has-name is-boxed is-flex-direction-column">
                            <label class="label">Fotografía</label>
                            <label class="file-label">
                                <input onInput={handleFileUpload} multiple={false} class="file-input" type="file" accept="image/*" />
                                <span class="file-cta" style={{ "border-radius": report.imagen ? undefined : "6px" }}>
                                    <span class="file-icon">
                                        <FaSolidUpload class="is-size-5" />
                                    </span>
                                    <span class="file-label">
                                        Elige una fotografía
                                    </span>
                                </span>

                                <Show when={report.imagen}>
                                    <span style={{ "min-width": "100%" }} class="file-name">
                                        <div class="is-flex is-align-items-baseline">
                                            <span class="icon is-left">
                                                <FaSolidCamera class="has-text-info is-size-5" aria-hidden="true" />
                                            </span>
                                            <span class="m-auto">{report.imagen?.id}.{report.imagen?.extension}</span>
                                        </div>
                                    </span>
                                </Show>

                            </label>
                        </div>

                        <div class="cell">
                            <label class="label">Problema Detectado</label>
                            <p class="control has-icons-left">
                                <textarea
                                    onInput={(e => report.problema = e.target.value)}
                                    placeholder="Se encontraron cucarachas en el lavadero..."
                                    value={report.problema}
                                    class="input"
                                    required
                                    rows={4}
                                />
                                <span class="icon is-medium is-left">
                                    <FaSolidCircleInfo class="has-text-warning" />
                                </span>
                            </p>
                        </div>

                        <div class="block" />

                        <div class="cell field is-flex-direction-column">
                            <label class="label">Recomendaciones</label>
                            <div style={inputHeight} class={classNames("control is-expanded", ["has-icons-left", isWideScreen()])}>
                                <div class="select is-fullwidth is-multiple">
                                    <select ref={suggestionsRef} required
                                        onChange={(e => setActions(e.target.selectedOptions))}
                                        multiple name="recomendaciones"
                                        title="Elegir sugerencias"
                                        size="4"
                                    >
                                        <Index each={AccionesRecomendadas}>
                                            {(accion) =>
                                                <option value={accion()}>
                                                    ➕ {accion()}
                                                </option>}
                                        </Index>
                                    </select>
                                </div>
                                <Show when={isWideScreen()}>
                                    <div class="icon is-small is-left">
                                        <FaSolidBug />
                                    </div>
                                </Show>
                            </div>
                        </div>

                        <div class="field is-flex is-justify-content-center gap-3" style={{ "margin-top": "4rem" }}>
                            <button type="button"
                                onClick={() => {
                                    picker.showModal = false;
                                    clearReportForm();
                                }}
                                class="column button is-danger is-outlined"
                            >
                                <span class="text-top">Cancelar</span>
                                <span class="icon">
                                    <FaSolidXmark />
                                </span>
                            </button>

                            <button type="button"
                                class="column button is-success is-outlined"
                                onClick={() => {
                                    picker.showModal = false;
                                    saveReport();
                                }}
                            >
                                <span class="text-top">Guardar</span>
                                <span class="icon">
                                    <FaSolidCirclePlus />
                                </span>
                            </button>
                        </div>
                    </div>


                </form>
            </Modal>

            {/* List that shows the added reports, allows deleting and editing */}
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

            {/* Button to add a new report */}
            <div class="field">
                <div class="control">
                    <button type="button" class="button is-fullwidth" onClick={() => picker.showModal = true}>
                        <span>Nueva recomendación</span>
                        <span class="icon">
                            <FaSolidCirclePlus />
                        </span>
                    </button>
                </div>
            </div>
        </>
    );
}