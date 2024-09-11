import { classNames, windowSize } from "@/utils";
import { Index, Show } from "solid-js";
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

function handleFileUpload(e: InputEvent & {
    currentTarget: HTMLInputElement;
    target: HTMLInputElement;
}) {
    const { files } = e.target || {};
    if (files) {
        console.log(files[0]);
    }
}

export function SuggestionPicker(_props: any) {
    const isWideScreen = () => windowSize.width > 900;
    const inputHeight = { height: "115px" };

    return (
        <>
            <div class="fixed-grid has-3-cols marginless">
                <div class={classNames(["grid", isWideScreen()])}>

                    <div class="file has-name is-boxed is-flex-direction-column">
                        <label class="label">Fotografía</label>
                        <label style={inputHeight} class="file-label">
                            <input onInput={handleFileUpload} class="file-input" type="file" accept="image/*" />
                            <span class="file-cta">
                                <span class="file-icon">
                                    <i class="fas fa-upload"></i>
                                </span>
                                <span class="file-label">
                                    Elige una foto…
                                </span>
                            </span>
                            <span style={{ "min-width": "100%" }} class="file-name">
                                Problema Reportado-{dayjs().format("YYYY-MM-DDTHH:mm:ss")}.png
                            </span>
                        </label>
                    </div>

                    <div class="cell">
                        <label class="label">Problema Detectado</label>
                        <p class="control has-icons-left">
                            <textarea rows={4} class="input" placeholder="Se encontraron cucarachas en el lavadero..." />
                            <span class="icon is-medium is-left">
                                <i class="fas fa-info-circle" />
                            </span>
                        </p>

                    </div>

                    <div class="cell field is-flex-direction-column">
                        <label class="label">Inspección y recomendaciones</label>
                        <div style={inputHeight} class={classNames("control is-expanded", ["has-icons-left", isWideScreen()])}>
                            <div class="select is-fullwidth is-multiple">
                                <select multiple name="recomendaciones" size="3">
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
                </div>
            </div>

            <div class="field is-grouped is-justify-content-center marginless">
                <div class="control">
                    <button type="button" class="button">
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