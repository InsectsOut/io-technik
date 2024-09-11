import { destructure } from "@solid-primitives/destructure";
import { createEffect } from "solid-js";

import { SuggestionPicker } from "./SuggestionPicker";
import SignaturePad from "signature_pad";

import { Tables } from "@/supabase";
import { classNames } from "@/utils";

import css from "../Service.module.css";

type ReportProps = {
    service?: Tables<"Servicios">
}

export function ServiceReport(props: ReportProps) {
    if (!props.service) {
        return null;
    }

    const { horario_servicio } = destructure(props.service!);
    let signPad: SignaturePad | undefined;

    createEffect(() => {
        const canvas = document.querySelector("canvas")!;
        signPad = new SignaturePad(canvas, {
            backgroundColor: "#EAEAEA",
            penColor: "black"
        });

        resizeCanvas();
        return () => window.removeEventListener("resize", resizeCanvas);
    });

    function clearSignature() {
        signPad?.clear();
    }

    function resizeCanvas() {
        const canvas = document.querySelector("canvas");
        if (!canvas) {
            return;
        }

        const ratio = Math.max(window.devicePixelRatio || 1, 1) * 0.75;
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = 450;
        canvas.getContext("2d")?.scale(ratio, ratio);
        signPad?.clear();
    }

    function downloadSignature() {
        if (signPad?.isEmpty()) {
            return alert("Por favor agregue una firma");
        }

        // Create download link and trigger download
        const link = document.createElement('a');
        link.href = signPad!.toDataURL("image/png");
        link.download = "firma_cliente.png";

        document.body.appendChild(link).click();
        document.body.removeChild(link);
    }

    function saveSignature() {
        if (signPad?.isEmpty()) {
            return alert("Por favor agregue una firma");
        }

        const data = signPad!.toDataURL("image/png");
        console.log(data);
        window.open(data);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return (
        <form>
            <div class={classNames("field is-grouped is-flex-direction-column", css.io_field)}>
                <label class="label">Hora de Entrada</label>
                <p class="control has-icons-left">
                    <input required class="input" type="time" value={horario_servicio()} />
                    <span class="icon is-medium is-left">
                        <i class="fas fa-door-open" />
                    </span>
                </p>

                <label class="label">Hora de Salida</label>
                <p class="control has-icons-left">
                    <input required class="input" type="time" min={horario_servicio()} />
                    <span class="icon is-medium is-left">
                        <i class="fas fa-door-closed" />
                    </span>
                </p>

            </div>

            <div class={classNames("field is-flex-direction-column", css.io_field)}>
                <label class="label">Frecuencia sugerida de servicio</label>
                <div class="control is-grouped has-icons-left is-expanded">
                    <div class="select is-fullwidth">
                        <select name="frecuencia">
                            <option selected>7 días</option>
                            <option>15 días</option>
                            <option>30 días</option>
                            <option>60 días</option>
                            <option>90 días</option>
                            <option>180 días</option>
                        </select>
                    </div>
                    <div class="icon is-small is-left">
                        <i class="fas fa-clock-rotate-left"></i>
                    </div>
                </div>
            </div>

            { /* Component for service suggestions and photo reports */
                <SuggestionPicker />}

            <div class="field io-signature">
                <label class="label">Firma del cliente</label>
                <canvas width={400} height={450} />

                <div class="field is-grouped is-justify-content-center gapless">
                    <div class="control">
                        <button type="button" class="button sign-btn is-warning" onClick={clearSignature}>
                            Limpiar
                        </button>
                    </div>
                    <div class="control">
                        <button type="button" class="button sign-btn is-info is-light" onClick={downloadSignature}>
                            Descargar
                        </button>
                    </div>
                    <div class="control">
                        <button type="button" class="button sign-btn is-link is-light" onClick={saveSignature}>
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>

            <div class="field is-grouped is-justify-content-center">
                <div class="control">
                    <button class="button is-success is-outlined">
                        <span>Guardar Reporte</span>
                        <span class="icon">
                            <i class="fas fa-cloud-arrow-up"></i>
                        </span>
                    </button>
                </div>
            </div>
        </form>
    );
}