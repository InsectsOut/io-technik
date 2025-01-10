import { destructure } from "@solid-primitives/destructure";
import { createMutable } from "solid-js/store";
import { createEffect, createSignal, createUniqueId, Index } from "solid-js";

import { SuggestionPicker } from "./SuggestionPicker";
import SignaturePad from "signature_pad";

import { classNames, getFileExtension, ImgFile, isOk } from "@/utils";
import { IO_Database, supabase, Tables } from "@/supabase";
import { Modal, useToast } from "@/components";
import { LocaleMX } from "@/constants";

import { FrecuenciaServicio, isFrecuencia, Recomendacion } from "../Service.types";
import { setCanSwipe } from "../Service";

import css from "../Service.module.css";

type ReportProps = {
    service?: Tables<"Servicios">
    onReportSubmit?: () => void;
};

type InputEvent = Event & {
    currentTarget: HTMLInputElement;
    target: HTMLInputElement;
};

type SelectEvent = Event & {
    currentTarget: HTMLSelectElement;
    target: HTMLSelectElement;
};

export function ServiceReport(props: ReportProps) {
    if (!props.service) {
        return null;
    }

    const {
        firma_cliente,
        horario_servicio,
        horario_entrada,
        horario_salida,
        frecuencia_recomendada
    } = destructure(props.service);

    /** If the report is being saved currently */
    const [isSaving, setIsSaving] = createSignal(false);
    const [signSaved, setSignSaved] = createSignal(false);
    const { addToast } = useToast();

    /** Reference for the SignaturePad WebComponent */
    let signPad: SignaturePad | undefined;

    /** Store de un reporte de servicio llenado por un técnico */
    const reporte = createMutable({
        recomendaciones: [] as Recomendacion[],
        frecuencia: frecuencia_recomendada() ?? "Ninguna",
        horaInicio: horario_entrada() ?? horario_servicio(),
        horaSalida: horario_salida() ?? "",
        firma: {} as ImgFile,
    });

    createEffect(() => {
        // Loads the signature pad component and the saved signature if any
        const canvas = document.querySelector("canvas")!;
        signPad = new SignaturePad(canvas, {
            backgroundColor: "#EAEAEA",
            penColor: "black"
        });

        supabase.storage
            .from("imagenes_servicios")
            .download(firma_cliente() ?? "")
            .then(({ data }) => {
                if (!data) return;

                reporte.firma = {
                    extension: getFileExtension(firma_cliente() ?? ""),
                    file: new File([data], firma_cliente() ?? "", { type: data.type }),
                    id: firma_cliente() ?? ""
                }

                const base64Url = URL.createObjectURL(data);
                signPad!.fromDataURL(base64Url);

                setSignSaved(true);
                signPad?.off();

            }).catch(error => {
                console.error(error);
                setSignSaved(false);

                signPad?.clear();
                signPad?.on();
            });

        resizeCanvas();
        return () => window.removeEventListener("resize", resizeCanvas);
    });

    function clearSignature() {
        setSignSaved(false);
        signPad?.clear();
        signPad?.on();
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

    function saveSignature() {
        if (signSaved()) {
            signPad?.on();
            signPad?.clear();
            return setSignSaved(false);
        }

        if (signPad?.isEmpty()) {
            return addToast("Por favor agregue una firma", "is-warning");
        }

        const dataURL = signPad!.toDataURL("image/png");
        const binary = atob(dataURL.split(",")[1]); // Decode the Base64 string
        const array = new Uint8Array(binary.length);

        for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
        }

        const blob = new Blob([array], { type: "image/png" });
        const imgName = `firma_cliente_${createUniqueId()}`;

        reporte.firma = {
            extension: "png",
            file: new File([blob], imgName, { type: "image/png" }),
            id: imgName,
        }

        setSignSaved(true);
        signPad?.off();
    }

    function onTimeChange(event: InputEvent) {
        const { id, value } = event.target;
        const [hour, minutes] = value.split(":");
        const localDate = new Date();
        localDate.setHours(
            parseInt(hour), // Set hours
            parseInt(minutes), // Set minutes
            0 // Set seconds
        );

        if (id === "hora_entrada") {
            reporte.horaInicio = localDate.toLocaleTimeString(LocaleMX, {
                timeStyle: "medium",
                hour12: false
            });
        } else {
            reporte.horaSalida = localDate.toLocaleTimeString(LocaleMX, {
                timeStyle: "medium",
                hour12: false
            });
        }

        console.log(JSON.stringify(reporte));
    }

    function onFrequencyChange(event: SelectEvent) {
        if (isFrecuencia(event.target.value)) {
            reporte.frecuencia = event.target.value;
        }
    }

    async function onReportSubmit() {
        const imagesUploaded = new Map<string, string>();
        const serviceId = props.service?.id ?? NaN;

        function getImagePath(image: ImgFile) {
            const path = !image.id.startsWith(serviceId.toString())
                ? `${serviceId}/${image.id}`
                : image.id;

            imagesUploaded.set(image.id, path);
            return path;
        }

        const deleteRecomedations = await IO_Database
            .from("Recomendaciones")
            .delete()
            .eq("servicio_id", serviceId);

        const deleteImages = await supabase.storage
            .from("imagenes_servicios")
            .remove([firma_cliente() ?? ""]);

        if (deleteRecomedations.error || deleteImages.error) {
            return;
        }

        // Result of the service report image uploads
        const uploads = reporte.recomendaciones
            .filter(recomendacion => recomendacion.imagen?.file)
            .map((recomendacion) => supabase.storage
                .from("imagenes_servicios")
                .upload(
                    getImagePath(recomendacion.imagen!),
                    recomendacion!.imagen!.file,
                    { upsert: true }
                ));

        const signPath = getImagePath(reporte.firma);
        const signUpload = await supabase.storage
            .from("imagenes_servicios")
            .upload(
                signPath,
                reporte.firma.file,
                { upsert: true }
            );

        // Updates the service frequency and time
        const serviceUpdate = await IO_Database
            .from("Servicios")
            .update({
                firma_cliente: signUpload.error === null ? signPath : null,
                horario_entrada: reporte.horaInicio,
                horario_salida: reporte.horaSalida,
                frecuencia_recomendada: reporte.frecuencia,
            }).eq("id", props.service!.id);

        // Uploads the images and gets the full path for each of them
        await Promise.all(uploads);

        if (isOk(serviceUpdate)) {
            props.onReportSubmit?.();
        }

        // Inserts the recommendations into the database
        const insert = await IO_Database.from("Recomendaciones").insert(
            reporte.recomendaciones.map(r => ({
                imagen: imagesUploaded.get(r.imagen!.id) ?? null,
                acciones: [...r.acciones],
                problema: r.problema,
                servicio_id: props.service!.id
            }))
        );

        console.log(insert);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return (
        <>
            <form class="hide_scroll">
                {/* Hora de inicio y salida del servicio */}
                <div class={classNames("field is-grouped is-flex-direction-column", css.io_field)}>
                    <label class="label">Hora de Entrada</label>
                    <p class="control has-icons-left">
                        <input id="hora_entrada" required
                            onChange={onTimeChange}
                            value={reporte.horaInicio}
                            class="input"
                            type="time"
                        />
                        <span class="icon is-medium is-left">
                            <i class="fas fa-door-open is-brown" />
                        </span>
                    </p>

                    <label class="label">Hora de Salida</label>
                    <p class="control has-icons-left">
                        <input id="hora_salida" required
                            value={reporte.horaSalida}
                            onChange={onTimeChange}
                            class="input"
                            type="time"
                        />
                        <span class="icon is-medium is-left">
                            <i class="fas fa-door-closed is-brown" />
                        </span>
                    </p>
                </div>

                {/* Frecuencia sugerida para el servicio */}
                <div class={classNames("field is-grouped is-flex-direction-column", css.io_field)}>
                    <label class="label">Frecuencia sugerida de servicio</label>
                    <div class="control is-grouped has-icons-left is-expanded">
                        <div class="select is-fullwidth">
                            <select name="frecuencia" onChange={onFrequencyChange}>
                                <Index each={FrecuenciaServicio}>
                                    {(frecuencia) =>
                                        <option selected={reporte.frecuencia === frecuencia()} value={frecuencia()}>
                                            - {frecuencia()}
                                        </option>}
                                </Index>
                            </select>
                        </div>
                        <div class="icon is-small is-left">
                            <i class="fas fa-clock-rotate-left has-text-info" />
                        </div>
                    </div>
                </div>

                {/* Sugerencias y recomendaciones */}
                <SuggestionPicker
                    servicioId={props.service!.id}
                    onSuggestionAdd={(sugerencias) => {
                        reporte.recomendaciones = sugerencias;
                    }} />

                {/* Firma del cliente en formato .png  */}
                <div class="field io-signature">
                    <label class="label">Firma del cliente</label>
                    <canvas id="sign_canvas" width={400} height={450}
                        onTouchStart={() => setCanSwipe(false)}
                        onTouchEnd={() => setCanSwipe(true)}
                        style={{
                            "border-color": signSaved() ? "orange" : "green",
                            "border-style": "solid",
                            "border-width": "medium"
                        }}
                    />

                    <div class="field is-grouped is-justify-content-center gapless">
                        <div class="control">
                            <button type="button" class="button sign-btn is-danger is-dark" onClick={clearSignature}>
                                Limpiar
                            </button>
                        </div>
                        <div class="control">
                            <button
                                class={classNames("button sign-btn is-dark is-success", ["is-warning", signSaved()])}
                                onClick={saveSignature}
                                type="button"
                            >
                                {signSaved() ? "Cambiar firma" : "Aceptar Firma"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            <Modal show={isSaving()}>
                <span class="icon-text is-align-items-baseline has-icons-left is-flex is-justify-content-center gapless">
                    <span class="icon is-large is-right">
                        <i class="fas fa-save" />
                    </span>
                    <span class="subtitle has-text-center marginless">Guardando Reporte...</span>
                </span>

                <progress class="progress is-primary" style={{ margin: "auto" }} max="100" />
            </Modal>

            {/* Botón para guardar el reporte */}
            <div class="panel-block is-justify-content-center">
                <button class="button is-success is-outlined is-fullwidth"
                    onClick={() => {
                        setIsSaving(true);
                        onReportSubmit()
                            .then(() => {
                                setIsSaving(false);
                                addToast("Servicio guardado correctamente", "is-info");
                            })
                            .catch(() => setIsSaving(false));
                    }}
                >
                    <span>Guardar Reporte</span>
                    <span class="icon">
                        <i class="fas fa-cloud-arrow-up" />
                    </span>
                </button>
            </div>
        </>
    );
}