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
    const { id: employee_id, tipo_rol } = employeeProfile() ?? {};

    const serviceQuery = IO_Database
        .from("Servicios")
        .select(`*, Clientes(*), Direcciones(ubicacion)`)
        .order("horario_servicio")

    // If the user is not a superadmin, only show their assigned services
    if (employee_id != null && tipo_rol !== "superadmin") {
        serviceQuery.eq("aplicador_Responsable", employee_id);
    }

    // If a date is provided, filter by that date
    if (date) {
        const serviceDate = date.format("YYYY-MM-DD");
        serviceQuery.eq("fecha_servicio", serviceDate);
    }

    return (await serviceQuery).data;
}