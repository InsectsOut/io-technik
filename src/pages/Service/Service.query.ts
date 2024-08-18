import { IO_Database } from "@/supabase";

/**
 * Fetches insects out services and their related clients
 * @returns A `promise` the resolves to an array of `Servicios`, null otherwise
*/
export async function fetchServiceById(id: string) {
    if (!id) {
        return null;
    }

    /** Base service query */
    const query = IO_Database
        .from("Servicios")
        .select(`*, Clientes(*), Direcciones(*)`)
        .eq("id", parseInt(id, 10))
        .limit(1)
        .maybeSingle();

    return (await query).data;
}

/** Return type for a service query */
export type Service = NonNullable<ReturnType<typeof fetchServiceById>>