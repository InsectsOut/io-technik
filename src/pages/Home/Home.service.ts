import { Database } from "@/supabase";

/**
 * Fetches insects out services and their related clients
 * @returns A `promise` the resolves to an array of `Servicios`, null otherwise
 */
export async function fetchServices() {
    const services = await Database
        .from("Servicios")
        .select(`*, Clientes(*)`)
        .limit(10);

    return services.data;
}