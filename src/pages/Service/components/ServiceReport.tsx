import { Tables } from "@/supabase";
import { DeviceType, deviceType } from "@/utils";
import { destructure } from "@solid-primitives/destructure";
import SignaturePad from "signature_pad";
import { createEffect, Index } from "solid-js";

type ReportProps = {
    service?: Tables<"Servicios">
}

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

        const ratio = Math.max(window.devicePixelRatio || 1, 1);
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
            <div class="field io-field is-grouped is-flex-direction-column">
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

            <div class="field io-field is-flex-direction-column">
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

            <div class="field is-flex-direction-column">
                <label class="label">Inspección y recomendaciones</label>
                <div class="control has-icons-left is-expanded">
                    <div class="select is-fullwidth is-multiple">
                        <select multiple name="recomendaciones" size={deviceType() > DeviceType.Mobile ? 5 : 3}>
                            <Index each={recomendaciones}>
                                {(recomendacion) => (
                                    <option value={recomendacion()}>
                                        {recomendacion()}
                                    </option>
                                )}
                            </Index>
                        </select>
                    </div>
                    <div class="icon is-small is-left">
                        <i class="fas fa-bug"></i>
                    </div>
                </div>
            </div>

            <div class="field io-signature">
                <label class="label">Firma del cliente</label>
                <canvas width={400} height={450} />

                <div class="field is-grouped is-justify-content-center">
                    <div class="control">
                        <button type="button" class="button is-warning" onClick={clearSignature}>
                            Limpiar
                        </button>
                    </div>
                    <div class="control">
                        <button type="button" class="button is-info is-light" onClick={downloadSignature}>
                            Descargar
                        </button>
                    </div>
                    <div class="control">
                        <button type="button" class="button is-link is-light" onClick={saveSignature}>
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