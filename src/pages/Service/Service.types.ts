import { ImgFile } from "@/utils";

/** Frencuencias de servicio válidas en días */
export const FrecuenciaServicio = Object.freeze({
    Ninguna: 0,
    Semanal: 7,
    Quincenal: 15,
    Mensual: 30,
    Bimestral: 60,
    Trimestral: 90,
    Semestral: 180,
    Anual: 365
});

/** Nombres válidos de frencuencias de servicio */
export type NombreFrecuencias = keyof typeof FrecuenciaServicio;

/** Valores válidos de frencuencias de servicio */
export type ValorFrencuencias = (typeof FrecuenciaServicio)[NombreFrecuencias];

/** Tipo para una sugerencia de servicio */
export type Sugerencia = {
    /** Recomendaciones de esta sugerencia */
    recomendaciones: string[];
    /** Problema encontrado en el servicio */
    problema: string;
    /** Imagen opcional adjunta al reporte */
    imagen?: ImgFile;
}