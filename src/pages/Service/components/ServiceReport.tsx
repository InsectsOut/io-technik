import { destructure } from "@solid-primitives/destructure";
import { createMutable } from "solid-js/store";
import { createEffect, createMemo, createSignal, createUniqueId, Index } from "solid-js";

import { SuggestionPicker } from "./SuggestionPicker";
import SignaturePad from "signature_pad";

import { Buckets, classNames, ImgFile, isOk } from "@/utils";
import { IO_Database, Logger, supabase, Tables } from "@/supabase";
import { Modal, useToast } from "@/components";
import { LocaleMX } from "@/constants";
import { InputEvent } from "@/types";

import { EstadosServicio, FrecuenciaServicio, isFrecuencia, isServicioStatus, ServicioEstatus } from "../Service.types";
import { setCanSwipe, setChangesUnsaved } from "../Service";
import { getServiceImgPath } from "../Service.utils";

import { FaRegularSquareCheck, FaSolidCheck, FaSolidClockRotateLeft, FaSolidCloudArrowUp, FaSolidDoorClosed, FaSolidDoorOpen, FaSolidXmark } from "solid-icons/fa";
import { TbProgressAlert } from "solid-icons/tb";
import { FiSave } from "solid-icons/fi";

import css from "../Service.module.css";
import { match } from "ts-pattern";

type ReportProps = {
    service?: Tables<"Servicios">
    onServiceUpdate?: () => void;
};

export function ServiceReport(props: ReportProps) {
    if (!props.service) {
        return null;
    }

    const {
        id,
        folio,
        firma_cliente,
        horario_servicio,
        horario_entrada,
        horario_salida,
        frecuencia_recomendada,
    } = destructure(props.service);

    /** Initial service state loaded from the database */
    const serviceState = () => match(props.service)
        .returnType<ServicioEstatus>()
        .with({ cancelado: true }, () => "Cancelado")
        .with({ realizado: true }, () => "Realizado")
        .otherwise(() => "Pendiente");

    /** Store de un reporte de servicio llenado por un técnico */
    const reporte = createMutable({
        frecuencia: frecuencia_recomendada() ?? "Ninguna",
        horaInicio: horario_entrada() ?? horario_servicio(),
        horaSalida: horario_salida() ?? "",
        estadoServicio: serviceState(),
    });

    const StateIcon = createMemo(() => match(reporte.estadoServicio)
        .with("Realizado", () => <FaSolidCheck class="has-text-primary is-size-5" />)
        .with("Cancelado", () => <FaSolidXmark class="has-text-danger is-size-5" />)
        .otherwise(() => <TbProgressAlert class="has-text-warning is-size-5" />));

    /** If the report is being saved currently */
    const [isSaving, setIsSaving] = createSignal(false);
    const [signSaved, setSignSaved] = createSignal(false);
    const { addToast } = useToast();

    /** Reference for the HTML canvas element */
    let canvasRef: Maybe<HTMLCanvasElement>;
    /** Reference for the SignaturePad WebComponent */
    let signPad: Maybe<SignaturePad>;

    createEffect(() => {
        // Loads the signature pad component and the saved signature if any
        signPad = canvasRef ? new SignaturePad(canvasRef) : undefined;

        supabase.storage
            .from(Buckets.ImagenesServicios)
            .download(firma_cliente() ?? "")
            .then(({ data }) => {
                if (!data) return;

                const base64Url = URL.createObjectURL(data);
                signPad?.fromDataURL(base64Url);

                setSignSaved(true);
                signPad?.off();

            }).catch(error => {
                setSignSaved(false);
                Logger.write({
                    message: `Error loading signature: ${error.message}`,
                    severity: "Low",
                    type: "Error"
                });

                signPad?.clear();
                signPad?.on();
            });

        resizeCanvas();
        return () => window.removeEventListener("resize", resizeCanvas);
    });

    function clearSignature() {
        setChangesUnsaved(true);
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

    async function saveSignature() {
        if (signSaved()) {
            signPad?.on();
            signPad?.clear();
            setChangesUnsaved(true);
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
        const signFile: ImgFile = {
            extension: "png",
            file: new File([blob], imgName, { type: "image/png" }),
            id: imgName,
        }

        const signPath = getServiceImgPath(signFile, folio());
        const imgUpload = await supabase.storage
            .from(Buckets.ImagenesServicios)
            .upload(
                signPath,
                signFile.file,
                { upsert: true }
            );

        if (imgUpload.data) {
            const update = await supabase
                .from("Servicios")
                .update({ firma_cliente: signPath })
                .eq("id", id());

            if (update.error) {
                addToast("Error actualizando la firma", "is-danger");
            }
        }

        if (imgUpload.data) {
            addToast("Firma guardada correctamente", "is-info");
            setSignSaved(true);
            props.onServiceUpdate?.();
            signPad?.off();
        } else {
            addToast(imgUpload.error.message, "is-danger");
            setSignSaved(false);
        }
    }

    function onTimeChange(event: InputEvent<HTMLInputElement>) {
        const { id, value } = event.target;
        const [hour, minutes] = value.split(":");
        const localDate = new Date();
        const timeKey = id === "hora_entrada" ? "horaInicio" : "horaSalida";
        setChangesUnsaved(true);
        localDate.setHours(
            parseInt(hour), // Set hours
            parseInt(minutes), // Set minutes
            0 // Set seconds
        );

        reporte[timeKey] = localDate.toLocaleTimeString(LocaleMX, {
            timeStyle: "medium",
            hour12: false
        });
    }

    function onFrequencyChange({ target }: InputEvent<HTMLSelectElement>) {
        if (isFrecuencia(target.value)) {
            reporte.frecuencia = target.value;
            setChangesUnsaved(true);
        }
    }

    function onServiceStateChange({ target }: InputEvent<HTMLSelectElement>) {
        if (isServicioStatus(target.value)) {
            reporte.estadoServicio = target.value;
            setChangesUnsaved(true);
        }
    }

    function setTimeToNow(event: "entrada" | "salida") {
        const timeKey = event === "entrada" ? "horaInicio" : "horaSalida";
        const localDate = new Date();
        localDate.setSeconds(0);
        setChangesUnsaved(true);

        reporte[timeKey] = localDate.toLocaleTimeString(LocaleMX, {
            timeStyle: "medium",
            hour12: false
        });
    }

    async function onServiceUpdate() {
        setIsSaving(true);

        // Updates the service frequency, time and status
        const serviceUpdate = await IO_Database
            .from("Servicios")
            .update({
                horario_entrada: reporte.horaInicio,
                horario_salida: reporte.horaSalida,
                frecuencia_recomendada: reporte.frecuencia,
                cancelado: reporte.estadoServicio === "Cancelado",
                realizado: reporte.estadoServicio === "Realizado",
            }).eq("id", props.service!.id);

        if (isOk(serviceUpdate)) {
            props.onServiceUpdate?.();
        }

        if (serviceUpdate.error) {
            setIsSaving(false);
            setChangesUnsaved(true);
            return addToast("Error guardando el servicio", "is-warning");
        }

        setIsSaving(false);
        setChangesUnsaved(false);
        addToast("Servicio guardado correctamente", "is-info");
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    return (
        <>
            <form class="hide-scroll">
                {/* Hora de inicio y salida del servicio */}
                <div class={classNames("field is-grouped is-flex-direction-column", css.io_field)}>
                    <label class="label">Hora de Entrada</label>
                    <p class="control has-icons-left has-icons-right">
                        <input title="Hora de entrada" id="hora_entrada" required
                            onChange={onTimeChange}
                            value={reporte.horaInicio}
                            class="input"
                            type="time"
                        />
                        <span class="icon is-medium is-left">
                            <FaSolidDoorOpen class="is-brown is-size-5" />
                        </span>
                        <span onClick={() => setTimeToNow("entrada")}
                            class="icon is-medium is-right is-clickable mr-5 z-10"
                            title="Marcar entrada"
                        >
                            <span class="mr-2 normal-txt">Ahora</span>
                            <FaRegularSquareCheck class="is-size-4 has-text-primary" />
                        </span>
                    </p>

                    <label class="label">Hora de Salida</label>
                    <p class="control has-icons-left has-icons-right">
                        <input title="Hora de salida" id="hora_salida" required
                            value={reporte.horaSalida}
                            onChange={onTimeChange}
                            class="input"
                            type="time"
                        />
                        <span class="icon is-medium is-left">
                            <FaSolidDoorClosed class="is-brown is-size-5" />
                        </span>
                        <span onClick={() => setTimeToNow("salida")}
                            class="icon is-medium is-right is-clickable mr-5 z-10"
                            title="Marcar salida"
                        >
                            <span class="mr-2 normal-txt">Ahora</span>
                            <FaRegularSquareCheck class="is-size-4 has-text-primary" />
                        </span>
                    </p>
                </div>

                {/* Frecuencia sugerida para el servicio */}
                <div class={classNames("field two_col_grid", css.io_field)}>
                    <label class="label">Frecuencia sugerida de servicio</label>
                    <div class="control is-grouped has-icons-left is-expanded">
                        <div class="select is-fullwidth">
                            <select title="Frecuencia" name="frecuencia" onChange={onFrequencyChange}>
                                <Index each={FrecuenciaServicio}>
                                    {(frecuencia) =>
                                        <option selected={reporte.frecuencia === frecuencia()} value={frecuencia()}>
                                            {frecuencia()}
                                        </option>}
                                </Index>
                            </select>
                        </div>
                        <div class="icon is-small is-left">
                            <FaSolidClockRotateLeft class="is-size-5 has-text-info" />
                        </div>
                    </div>

                    <label class="label">Estado del Servicio</label>
                    <div class="control is-grouped has-icons-left is-expanded">
                        <div class="select is-fullwidth">
                            <select title="Estado del servicio" name="estado_servicio" onChange={onServiceStateChange}>
                                <Index each={EstadosServicio}>
                                    {(estado) =>
                                        <option selected={reporte.estadoServicio === estado()} value={estado()}>
                                            {estado()}
                                        </option>}
                                </Index>
                            </select>
                        </div>
                        <div class="icon is-small is-left">
                            {StateIcon()}
                        </div>
                    </div>
                </div>

                {/* Sugerencias y recomendaciones */}
                <SuggestionPicker servicio={props.service} />

                {/* Firma del cliente en formato .png  */}
                <div class="field io-signature">
                    <label class="label">Firma del cliente</label>
                    <canvas id="sign_canvas" width={400} height={450} ref={canvasRef!}
                        onTouchStart={() => setCanSwipe(false)}
                        onTouchEnd={() => setCanSwipe(true)}
                        style={{
                            "border-color": signSaved() ? "orange" : "green",
                            "background-color": "#EAEAEA",
                            "border-style": "solid",
                            "border-width": "medium"
                        }}
                    />

                    <div class="field is-grouped is-justify-content-center gap-0">
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
                                {signSaved() ? "Cambiar firma" : "Guardar Firma"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            <Modal show={isSaving()}>
                <span class="is-flex is-justify-content-center p-2 fullwidth gap-2">
                    <FiSave class="is-size-4" />
                    <span class="subtitle has-text-center">
                        Guardando Reporte...
                    </span>
                </span>

                <progress class="progress is-primary m-auto fullwidth" max="100" />
            </Modal>

            {/* Botón para guardar el reporte */}
            <div class="panel-block is-justify-content-center">
                <button class="button is-success is-outlined is-fullwidth" onClick={onServiceUpdate}>
                    <span>Guardar Reporte</span>
                    <span class="icon">
                        <FaSolidCloudArrowUp class="is-size-5" />
                    </span>
                </button>
            </div>
        </>
    );
}