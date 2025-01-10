import { IO_Database } from "@/supabase";
import { QueryData } from "@supabase/supabase-js";
import { Dayjs } from "dayjs";

/** Return type for a service query */
export type Service = NonNullable<QueryData<typeof query>[number]>

/** Base service query */
const query = IO_Database
    .from("Servicios")
    .select(`*, Clientes(*), Direcciones(ubicacion)`)
    .order("horario_servicio");

/**
 * Fetches insects out services and their related clients
 * @returns A `promise` that resolves to an array of `Servicios`, null otherwise
 */
export async function fetchServices(date?: Dayjs) {
    /** TODO: Remove check here so we can check services by date */
    if (date) {
        const serviceDate = date.format("YYYY-MM-DD")
        query.eq("fecha_servicio", serviceDate);
    }

    return (await query).data;
}