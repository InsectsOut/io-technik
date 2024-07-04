import { Database } from "@/supabase";
import { QueryData } from "@supabase/supabase-js";

/** Return type for a service query */
export type Service = NonNullable<QueryData<typeof query>>

/** Base service query */
const query = Database
    .from("Servicios")
    .select(`*, Clientes(*)`)
    .eq("id", "")
    .limit(1)
    .maybeSingle();

/**
 * Fetches insects out services and their related clients
 * @returns A `promise` the resolves to an array of `Servicios`, null otherwise
 */
export async function fetchServiceById(id: string) {
    if (!id) {
        return null;
    }

    /** Base service query */
    const query = Database
        .from("Servicios")
        .select(`*, Clientes(*)`)
        .eq("id", parseInt(id, 10))
        .limit(1)
        .maybeSingle();

    return (await query).data;
}