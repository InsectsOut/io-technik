import dayjs, { Dayjs } from "dayjs";
import { createUniqueId } from "solid-js";
import { match } from "ts-pattern";
import { Tabs } from "./Service.types";

/**
 * Returns a date object using the provided `fecha` and `hora`
 * @param fecha The service date to use
 * @param hora The service time to use
 * @param useDayJs If the return should be a `dayjs` object instead
 * @returns A date/dayjs object set to the provided datetime
 */
export function getServiceDate(fecha: string, hora: string, useDayJs = false): Date | Dayjs | null {
    try {
        const date = new Date(`${fecha}T${hora}`);
        return useDayJs ? dayjs(date) : date;
    } catch (error) {
        return null;
    }
}

/** Order in which to cycle the service tabs */
export const tabOrder: Tabs[] = [
    "detalles", "contacto", "suministros", "reporte"
];

/** Generates a unique `id/timestamp` for an img upload */
export function getImageId() {
    return `reporte-${dayjs().format("YYYY-MM-DD")}-${createUniqueId()}`;
}

/** Simplifies the units presentation */
export const getSimpleUnit = (unit: string) => match(unit.toLowerCase())
    .with("kilogramos", () => "kg")
    .with("mililitros", () => "ml")
    .with("unidades", () => "pz")
    .with("litros", () => "lts")
    .with("gramos", () => "gr")
    .otherwise(() => unit);