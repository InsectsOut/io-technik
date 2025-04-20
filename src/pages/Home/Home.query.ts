import { QueryData } from "@supabase/supabase-js";
import { IO_Database } from "@/supabase";

import { employeeProfile } from "@/state";
import { match } from "ts-pattern";
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
    const employeeData = employeeProfile();
    if (!employeeData) return null;

    const { id: employee_id, tipo_rol, organizacion } = employeeData;
    const useFolio = folio != null && !isNaN(folio);
    const serviceQuery = IO_Database
        .from("Servicios")
        .select(`*, Clientes(*), Direcciones(ubicacion)`)
        .order("horario_servicio");

    const filteredQuery = match(tipo_rol)
        .with("superadmin", () => {
            const superQuery = useFolio ? serviceQuery.eq("folio", folio) : serviceQuery;
            const serviceDate = date?.format("YYYY-MM-DD");
            return serviceDate && !useFolio
                ? superQuery.eq("fecha_servicio", serviceDate)
                : superQuery;
        })
        .with("administrador", () => {
            const serviceDate = date?.format("YYYY-MM-DD");
            const adminQuery = serviceQuery.eq("organizacion", organizacion ?? "")
            const folioQuery = useFolio ? adminQuery.eq("folio", folio) : adminQuery;

            return serviceDate && !useFolio
                ? folioQuery.eq("fecha_servicio", serviceDate)
                : folioQuery;
        })
        .with("tecnico", () => {
            const serviceDate = date?.format("YYYY-MM-DD");
            const userQuery = serviceQuery
                .eq("organizacion", organizacion ?? "")
                .eq("tecnico_id", employee_id ?? "");

            return serviceDate
                ? userQuery.eq("fecha_servicio", serviceDate)
                : userQuery;
        })
        .otherwise(() => serviceQuery);

    return (await filteredQuery).data;
}