import { IO_Database, Tables } from "@/supabase";

/** Return type for a service query */
export type Service = Tables<"Servicios">
/**
 * Fetches insects out services and their related clients
 * @returns A `promise` the resolves to an array of `Servicios`, null otherwise
 */
export async function fetchServiceById(id: string): Promise<Service | null> {
    if (!id) {
        return null;
    }

    /** Base service query */
    const query = IO_Database
        .from("Servicios")
        .select(`*, Clientes(*)`)
        .eq("id", parseInt(id, 10))
        .limit(1)
        .maybeSingle();

    return (await query).data;
}