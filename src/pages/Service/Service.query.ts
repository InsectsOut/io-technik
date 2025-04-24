import { employeeProfile } from "@/state";
import { IO_Database } from "@/supabase";

/** Return type of a fetched Service */
export type ServiceDetails = NonNullable<
    Awaited<ReturnType<typeof getServiceByFolio>>
>;

/**
 * Fetches insects out services and their related clients
 * @param folio Unique key to reference the service
 * @returns A `promise` that resolves to a `Servicio` object, null otherwise
*/
export async function getServiceByFolio(folio: string, org: string) {
    const employeeData = employeeProfile();
    if (!employeeData || !employeeData.tipo_rol) return null;
    if (!folio || !org) {
        return null;
    }

    /** Base service query */
    const { data } = await IO_Database
        .from("Servicios")
        .select(`*,
            Clientes(*),
            Direcciones(*),
            Responsables(*),
            Empleados!Servicios_tecnico_id_fkey(nombre, organizacion),
            RegistroAplicacion(*, Productos(*))`
        )
        .eq("organizacion", org)
        .eq("folio", folio)
        .limit(1)
        .maybeSingle();

    return data;
}