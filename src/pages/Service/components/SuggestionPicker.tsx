import { createEffect, createSignal, For, Index, onCleanup, onMount, Show } from "solid-js";
import { createMutable, createStore } from "solid-js/store";
import { destructure } from "@solid-primitives/destructure";
import { createQuery } from "@tanstack/solid-query";

import { Buckets, classNames, getFileExtension, windowSize } from "@/utils";
import { IO_Database, supabase, Tables } from "@/supabase";
import { Modal, useToast } from "@/components";

import { getImageId, getServiceImgPath } from "../Service.utils"
import { Recomendacion } from "../Service.types";
import { InputEvent } from "@/types";

import { AccionesRecomendadas } from "./Suggestion.constants";
import { getRecomendaciones } from "./Suggestion.query";

import { FaRegularEyeSlash, FaRegularImage, FaSolidBug, FaSolidCamera, FaSolidCircleInfo, FaSolidCirclePlus, FaSolidListCheck, FaSolidTrashCan, FaSolidUpload, FaSolidXmark } from "solid-icons/fa";
import { BsPencilSquare } from "solid-icons/bs";

/** Props for the suggestion picker component */
type PickerProps = {
    /** Parent service for the suggestion picker */
    servicio: Tables<"Servicios">;
    /** Callback that exposes the suggestions array on change */
    onSuggestionAdd?: (suggestions: Recomendacion[]) => void;
};

/** Component picker to add multiple suggestion reports */
export function SuggestionPicker(props: PickerProps) {
    const { id: servicioId, folio } = destructure(props.servicio);
    const { addToast } = useToast();

    const query = createQuery(() => ({
        queryKey: [`recomendaciones/${servicioId()}`],
        queryFn: () => getRecomendaciones(servicioId().toString()),
        throwOnError: false
    }));

    /** Lista de sugerencias para un reporte de servicio */
    const [sugerencias, setSugerencias] = createStore<Recomendacion[]>([]);

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
        otras: [],
    });

    const isWideScreen = () => windowSize.width > 900;
    let suggestionsRef: HTMLSelectElement | undefined;

    // Load the suggestions from the DB and maps them to the local state
    createEffect(() => {
        const loadedData = query.data;

        if (!loadedData) {
            return;
        }

        // Maps the loaded data to the local state, including the image file
        const mappedEntries = loadedData.map(async item => {
            const imgData = item.imagen ? await supabase.storage
                .from(Buckets.ImagenesServicios)
                .download(item.imagen)
                .catch(_ => ({ data: null }))
                : null;

            const imgFile = imgData?.data
                ? new File([imgData.data], item.imagen!, { type: imgData.data.type })
                : undefined;

            return {
                id: item.id.toString(),
                acciones: item.acciones,
                problema: item.problema,
                imagen: imgFile && {
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

    /**
     * Handles adding an image file to the reports list
     * @param e An event that has the image payload
     */
    function handleFileUpload(e: InputEvent<HTMLInputElement>) {
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
     * Adds a new action to the other's list
     * @param action The action to be added to the list
     */
    function addOtherAction(e?: InputEvent<HTMLInputElement>) {
        const action = e?.target?.value.trim();
        if (!action) {
            return;
        }

        if (AccionesRecomendadas.includes(action)) {
            return addToast("No puedes agregar una acción recomendada como otra acción", "is-warning");
        }

        report.otras.push(action);
        // Clear the input field after adding the action
        e!.target.value = "";
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

    /** Deletes a suggestion locally if not upload, and removes it from the DB if uploaded */
    async function deleteSuggestion(index: number): Promise<any> {
        const sugerencia = sugerencias[index];
        if (!sugerencia.id) {
            return setSugerencias(s => s.filter((_, i) => i !== index));
        }

        const deleted = await IO_Database
            .from("Recomendaciones")
            .delete().eq("id", +sugerencia.id);

        await supabase.storage
            .from(Buckets.ImagenesServicios)
            .remove([sugerencia.imagen?.id ?? ""]);

        if (deleted?.error === null) {
            query.refetch();
            setSugerencias(sugerencias.filter((s) => s.id !== sugerencia.id));
            addToast("Sugerencia eliminada correctamente", "is-info");
        }
    }

    /**
     * Updates the active report with the selected suggestion and opens the modal
     * @param index The index of the suggestion to edit
     */
    function loadSuggestionForEdit(index: number) {
        const sugerencia = sugerencias[index];
        report.problema = sugerencia.problema;
        report.imagen = sugerencia.imagen;
        report.id = sugerencia.id;

        // Sets the others list to the actions that are not in the recommended actions
        report.acciones = sugerencia.acciones.filter(a => AccionesRecomendadas.includes(a));
        // Sets the default actions to the ones that are in the recommended actions
        report.otras = sugerencia.acciones.filter(a => !AccionesRecomendadas.includes(a));

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
    async function saveReport() {
        const imgUpload = report.imagen && await supabase.storage
            .from(Buckets.ImagenesServicios)
            .upload(
                getServiceImgPath(report.imagen!, folio()),
                report.imagen!.file,
                { upsert: true }
            );

        const update = await supabase
            .from("Recomendaciones")
            .upsert({
                id: parseInt(report.id ?? "") || undefined,
                acciones: [...new Set(report.acciones.concat(report.otras))],
                imagen: imgUpload?.data?.path,
                problema: report.problema,
                servicio_id: servicioId(),
            })
            .select("id");

        if (update.error) {
            addToast("Error guardando sugerencia", "is-danger");
            return clearReportForm();
        }

        const updateIndex = picker.isEditing ? picker.editIndex : sugerencias.length;
        addToast("Sugerencia guardada correctamente", "is-info");
        setSugerencias(updateIndex, { ...report, id: update.data?.[0].id.toString() });
        clearReportForm();

        if (picker.isEditing) {
            picker.isEditing = false;
            picker.editIndex = NaN;
        }
    }

    /** Clears the report form fields and unselects all suggestion options */
    function clearReportForm() {
        report.imagen = undefined;
        report.id = undefined;
        report.problema = "";
        report.acciones = [];
        report.otras = [];

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
                            <Index each={entry.acciones.concat(entry.otras).filter(Boolean)}>
                                {(suggestion) => (
                                    <li>{suggestion()}</li>
                                )}
                            </Index>
                        </ol>
                    </td>

                    <Show when={windowSize.width > 550}>
                        <td>
                            <div class="has-text-link is-clickable"
                                onClick={() => entry.imagen && setShowPreview(true)}
                            >
                                {entry.imagen?.id ?? "N/A"}
                            </div>
                            <Show when={entry.imagen && showPreview()}>
                                <Modal show={true} onClose={() => setShowPreview(false)}>
                                    <img alt={`${entry.imagen!.id} preview`}
                                        src={imgPreview()}
                                    />

                                    <button
                                        onClick={() => setShowPreview(false)}
                                        class="button fullwidth mt-4"
                                        type="button"
                                    >
                                        Cerrar
                                    </button>
                                </Modal>
                            </Show>
                        </td>

                        <td class="has-text-centered">
                            <div title="Editar" onClick={() => loadSuggestionForEdit(index)}>
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
                                <div title="Editar" onClick={() => loadSuggestionForEdit(index)} tabIndex={0}>
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
                                        class="button mt-4 fullwidth"
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

    return (
        <>
            {/* Modal element to show add or modify a report */}
            <Modal show={picker.showModal} onClose={() => {
                picker.showModal = false;
                clearReportForm();
            }}>
                <form class="form fixed-grid has-3-cols marginless paddingless height-auto">
                    <div class="is-flex is-justify-content-space-between">
                        <h2 class="subtitle pl-0 mb-2">
                            Nueva Recomendación
                        </h2>
                        <span class="icon is-left">
                            <BsPencilSquare class="is-size-4 has-text-info" aria-hidden="true" />
                        </span>
                    </div>

                    <div class="file has-name is-boxed is-flex-direction-column mb-1">
                        <label class="label my-1">Fotografía</label>
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
                                <span class="file-name fullwidth">
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
                        <label class="label my-1">Problema Detectado</label>
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

                    <div class="cell field is-flex-direction-column mb-0">
                        <label class="label my-1">Recomendaciones</label>
                        <div class={classNames("control is-expanded", ["has-icons-left", isWideScreen()])}>
                            <div class="select is-fullwidth is-multiple">
                                <select ref={suggestionsRef} required
                                    onChange={(e => setActions(e.target.selectedOptions))}
                                    multiple name="recomendaciones"
                                    title="Elegir sugerencias"
                                    size="3"
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
                    
                    { /* Show the additional actions list when not empty */}
                    <div class="cell field is-flex-direction-column mb-1">
                        <label class="label my-1">Otras recomendaciones</label>

                        <div class="is-flex is-align-items-center is-justify-content-space-between gap-2">
                            <input title="Otra recomendación" id="other"
                                onChange={addOtherAction}
                                placeholder="Recomendación adicional..."
                                maxlength={50}
                                class="input"
                                type="text"
                            />

                            <button type="button" class="column button is-info is-outlined p-2">
                                <span class="text-top">Agregar</span>
                                <span class="icon">
                                    <FaSolidListCheck />
                                </span>
                            </button>
                        </div>

                        <Show when={report.otras.length}>
                            <ol class="has-text-weight-semibold p-1 scrollable hide-scroll mt-2" style={{ "max-height": "75px" }}>
                                <Index each={report.otras}>
                                    {(accion, index) => (
                                        <li class="is-flex is-align-items-center is-justify-content-space-between gap-2">
                                            <span>{index + 1}. {accion()}</span>
                                            <div title="Borrar" onClick={() => report.otras.splice(index, 1)}>
                                                <span class="icon is-clickable">
                                                    <FaSolidTrashCan class="is-size-5 has-text-danger" aria-hidden="true" />
                                                </span>
                                            </div>
                                        </li>
                                    )}
                                </Index>
                            </ol>
                        </Show>
                    </div>

                    <div class="field is-flex is-justify-content-center gap-3 mt-5">
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
                </form>
            </Modal>

            {/* List that shows the added reports, allows deleting and editing */}
            <div class="table-container scrollable hide-scroll">
                <table class="table is-striped fullwidth">
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