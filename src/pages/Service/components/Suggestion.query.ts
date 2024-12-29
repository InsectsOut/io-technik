import { IO_Database } from "@/supabase";

/**
 * Fetches insects out services and their related clients
 * @param folio Unique key to reference the service
 * @returns A `promise` that resolves to a `Servicio` object, null otherwise
*/
export async function getRecomendaciones(servicioId: string) {
    if (!servicioId) {
        return null;
    }

    /** Base service query */
    const { data } = await IO_Database
        .from("Recomendaciones")
        .select(`*`)
        .eq("servicio_id", servicioId);

    return data;
}