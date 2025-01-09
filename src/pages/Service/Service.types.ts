import { Enums } from "@/supabase";
import { ImgFile } from "@/utils";

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
    "Anual"
];

/** Valida que un valor sea una frecuencia válida */
export function isFrecuencia(value: any): value is Frecuencia {
    return FrecuenciaServicio.includes(value);
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