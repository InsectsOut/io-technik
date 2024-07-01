import { Database } from "@/supabase";
import { QueryData } from "@supabase/supabase-js";
import { Dayjs } from "dayjs";

/** Return type for a service query */
export type Service = NonNullable<QueryData<typeof query>[number]>

/** Base service query */
const query = Database
    .from("Servicios")
    .select(`*, Clientes(*)`)
    .order("fecha_servicio")
    .limit(10);

/**
 * Fetches insects out services and their related clients
 * @returns A `promise` the resolves to an array of `Servicios`, null otherwise
 */
export async function fetchServices(showAll?: boolean, date?: Dayjs) {
    /** TODO: Remove check here so we can check services by date */
    if (date && !showAll) {
        const serviceDate = date.format("YYYY-MM-DD")
        query.eq("fecha_servicio", serviceDate);
    }

    return (await query).data;
}