import { Enums } from "@/supabase";
import { ImgFile } from "@/utils";
import { match } from "ts-pattern";

/** Nombres válidos de frencuencias de servicio */
export type Frecuencia = Enums<"FrecuenciaServicio">;

/** Frencuencias de servicio válidas en días */
export const FrecuenciaServicio: Frecuencia[] = [
    "Ninguna",
    "Semanal",
    "Quincenal",
    "Mensual",
    "Bimestral",
    "Trimestral",
    "Anual",
];

export const EstadosServicio: ServicioEstatus[] = [
    "Cancelado",
    "Pendiente",
    "Realizado",
];

/** Possible state values for a service */
export type ServicioEstatus = "Cancelado" | "Realizado" | "Pendiente";

/** Validates that a value is a valid `Frecuencia` value */
export function isFrecuencia(value: any): value is Frecuencia {
    return FrecuenciaServicio.includes(value);
}

/** Validates that a value is a valid `ServicioEstatus` value */
export function isServicioStatus(value: any): value is ServicioEstatus {
    return match(value)
        .with("Cancelado", "Realizado", "Pendiente", () => true)
        .otherwise(() => false);
}

/** Tabs to show for the service component */
export type Tabs = "detalles" | "reporte" | "contacto" | "suministros";

/** Tipo para una recomendación de servicio */
export type Recomendacion = {
    /* Identificador único de la recomendación */
    id?: string;
    /** Acciones de esta sugerencia */
    acciones: string[];
    /** Problema encontrado en el servicio */
    problema: string;
    /** Imagen opcional adjunta al reporte */
    imagen?: ImgFile;
}