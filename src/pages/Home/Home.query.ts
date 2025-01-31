import { QueryData } from "@supabase/supabase-js";
import { IO_Database } from "@/supabase";

import { employeeProfile } from "@/state";
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
    const serviceQuery = IO_Database
        .from("Servicios")
        .select(`*, Clientes(*), Direcciones(ubicacion)`)
        .order("horario_servicio");

    if (date) {
        const serviceDate = date.format("YYYY-MM-DD")
        serviceQuery.eq("fecha_servicio", serviceDate);
    }

    const { id: employee_id } = employeeProfile() ?? {};
    if (employee_id) {
        serviceQuery.eq("aplicador_Responsable", employee_id)
    }

    return (await serviceQuery).data;
}