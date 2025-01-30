import { destructure } from "@solid-primitives/destructure";
import { createEffect, createSignal } from "solid-js";
import { createMutable } from "solid-js/store";

import { FaSolidUpload } from "solid-icons/fa";
import { Buckets, ImgFile } from "@/utils";
import { useToast } from "@/components";
import { supabase } from "@/supabase";
import { employeeProfile } from "@/state";

import "./Feedback.module.css";

/** Extends the `InputEvent` with its target set to an `HTMLInputElement` */
type FileInputEvent = InputEvent & {
    currentTarget: HTMLInputElement;
    target: HTMLInputElement;
};

export function Feedback() {
    const { nombre } = destructure(employeeProfile()!)
    const [imgId, setImgId] = createSignal(getImgId());
    const { addToast } = useToast();

    async function saveReport() {
        const { id, file } = feedbackForm.captura || {};
        const fileAttached = !!(id && file);

        const result = fileAttached && await supabase.storage
            .from(Buckets.ReportesError)
            .upload(id, file, {
                upsert: true
            });

        if (result && result.error) {
            addToast("Error subiendo captura adjunta", "is-warning");
        }

        const insert = await supabase
            .from("ErroresSistema")
            .insert({
                imagen: result ? result.data?.fullPath : null,
                descripcion: feedbackForm.description,
                tipo_error: feedbackForm.tipo,
                titulo: feedbackForm.titulo,
                id_user: employeeProfile()?.id!
            });

        if (insert.error) {
            return addToast("Ha ocurrido un error cargando el reporte", "is-danger");
        }

        window.requestAnimationFrame(() => {
            // Clears the report
            feedbackForm.captura = undefined;
            feedbackForm.description = "";
            feedbackForm.titulo = "";
            feedbackForm.tipo = "";
        });
    }

    const feedbackForm = createMutable({
        captura: undefined as ImgFile | undefined,
        nombre: nombre(),
        description: "",
        titulo: "",
        tipo: "",
    });

    function getImgId() {
        return `Error-${new Date().toISOString()}.png`;
    }

    /**
         * Handles adding an image file to the reports list
         * @param e An event that has the image payload
         */
    function handleImgUpload(e: FileInputEvent) {
        const { files } = e.target || {};
        const [file] = files || [];
        if (!file) return;

        setImgId(getImgId());

        feedbackForm.captura = {
            extension: file.type.split("/")[1],
            id: imgId(),
            file
        };
    }

    createEffect(() => {
        console.clear();
        console.table({ ...feedbackForm })
    });

    return (
        <section>
            <h1 class="title no-padding">Reportar un Problema</h1>
            <div class="field">
                <label class="label">Nombre</label>
                <div class="control">
                    <input disabled class="input" type="text" value={nombre()} />
                </div>
            </div>
            <div class="field">
                <label class="label">Título</label>
                <div class="control">
                    <input onInput={(e) => feedbackForm.tipo = e.target.value}
                        placeholder="No hay ningún servicio"
                        class="input"
                        type="text"
                    />
                </div>
            </div>

            <div class="field">
                <label class="label">Descripción</label>
                <div class="control">
                    <textarea onInput={(e) => feedbackForm.description = e.target.value}
                        placeholder="Cuéntanos del problema que encontraste..."
                        class="textarea"
                    />
                </div>
            </div>

            <label class="label">Tipo de Error</label>
            <div class="field is-grouped is-column">
                <div class="control">
                    <div class="select">
                        <select onChange={(e) => feedbackForm.tipo = e.target.value}>
                            <option>Error de interfaz</option>
                            <option>No carga ningún servicio</option>
                            <option>No puedo salvar un reporte</option>
                            <option>Hay datos faltantes en un reporte</option>
                            <option>No se actualizan los datos de una vista</option>
                            <option>Se muestra una pantalla de error</option>
                        </select>
                    </div>
                </div>

                <div class="file has-name fullwidth">
                    <label class="file-label">
                        <input class="file-input" type="file" name="resume" onInput={handleImgUpload} multiple={false} />
                        <span class="file-cta file-btn">
                            <span class="file-icon">
                                <FaSolidUpload />
                            </span>
                            <span class="file-label"> Agrega una captura </span>
                        </span>
                        <span class="file-name"> {imgId()} </span>
                    </label>
                </div>
            </div>

            <div class="field is-grouped">
                <button class="column button is-link" onClick={saveReport}>Reportar</button>
                <button class="column button is-link is-light">Cancelar</button>
            </div>
        </section>
    );
}