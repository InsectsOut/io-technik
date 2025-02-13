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
export async function fetchServices(date?: Dayjs, folio?: number) {
    const { id: employee_id, tipo_rol } = employeeProfile() ?? {};
    const useFolio = folio != null && !isNaN(folio);
    const isSuperAdmin = tipo_rol === "superadmin";

    const serviceQuery = IO_Database
        .from("Servicios")
        .select(`*, Clientes(*), Direcciones(ubicacion)`)
        .order("horario_servicio");

    // If a folio is provided, filter by that folio
    if (isSuperAdmin && useFolio) {
        serviceQuery.eq("folio", folio);
    }

    // If the user is not a superadmin, only show their assigned services
    if (!isSuperAdmin && employee_id != null) {
        serviceQuery.eq("aplicador_Responsable", employee_id);
    }

    // If a date is provided, filter by that date
    if (date && !useFolio) {
        const serviceDate = date.format("YYYY-MM-DD");
        serviceQuery.eq("fecha_servicio", serviceDate);
    }

    return (await serviceQuery).data;
}