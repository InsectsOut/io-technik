import { destructure } from "@solid-primitives/destructure";
import { createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

import { classNames, ImgFile } from "@/utils";
import { userProfile } from "@/state";

import css from "./Feedback.module.css";

/** Extends the `InputEvent` with its target set to an `HTMLInputElement` */
type FileInputEvent = InputEvent & {
    currentTarget: HTMLInputElement;
    target: HTMLInputElement;
};

export function Feedback() {
    const { nombre } = destructure(userProfile() ?? { nombre: "" })
    const [imgId, setImgId] = createSignal(getImgId());

    const [feedbackForm, setFeedback] = createStore({
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

        setFeedback("captura", {
            extension: file.type.split("/")[1],
            id: imgId(),
            file
        });
    }

    createEffect(() => {
        console.clear();
        console.table({...feedbackForm})
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
                    <input onInput={(e) => setFeedback("titulo", e.target.value)}
                        placeholder="No hay ningún servicio"
                        class="input"
                        type="text"
                    />
                </div>
            </div>

            <div class="field">
                <label class="label">Descripción</label>
                <div class="control">
                    <textarea onInput={(e) => setFeedback("description", e.target.value)}
                        placeholder="Cuéntanos del problema que encontraste..."
                        class="textarea"
                    />
                </div>
            </div>

            <label class="label">Tipo de Error</label>
            <div class="field is-grouped is-column">
                <div class="control">
                    <div class="select">
                        <select onChange={(e) => setFeedback("tipo", e.target.value)}>
                            <option>Error de interfaz</option>
                            <option>No puedo salvar un reporte</option>
                            <option>No carga ningún servicio</option>
                            <option>Se muestra una pantalla de error</option>
                        </select>
                    </div>
                </div>

                <div class="file has-name is-fullwidth" style={{ width: "100%" }}>
                    <label class="file-label">
                        <input class="file-input" type="file" name="resume" onInput={handleImgUpload} multiple={false} />
                        <span class="file-cta file-btn">
                            <span class="file-icon">
                                <i class="fas fa-upload" />
                            </span>
                            <span class="file-label"> Agrega una captura </span>
                        </span>
                        <span class="file-name"> {imgId()} </span>
                    </label>
                </div>
            </div>

            <div class={classNames("field is-grouped", css.fixed_bottom)}>
                <button class="column button is-link">Reportar</button>
                <button class="column button is-link is-light">Cancelar</button>
            </div>
        </section>
    );
}