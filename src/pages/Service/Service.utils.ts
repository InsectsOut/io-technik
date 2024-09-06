import dayjs, { Dayjs } from "dayjs";

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