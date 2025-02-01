import { IO_Database } from "@/supabase";

/**
 * Fetches insects out services and their related clients
 * @param folio Unique key to reference the service
 * @returns A `promise` that resolves to a `Servicio` object, null otherwise
*/
export async function getServiceByFolio(folio: string) {
    if (!folio) {
        return null;
    }

    /** Base service query */
    const { data } = await IO_Database
        .from("Servicios")
        .select(`*,
            Clientes(*),
            Direcciones(*),
            Responsables(*),
            Empleados!Servicios_aplicador_Responsable_fkey(nombre),
            RegistroAplicacion(*, Productos(*))`
        )
        .eq("folio", folio)
        .limit(1)
        .maybeSingle();

    return data;
}