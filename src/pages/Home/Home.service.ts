import { Database } from "@/supabase";

export async function fetchServices() {
    const services = await Database
        .from("Servicios")
        .select(`*, Clientes(*)`)
        .limit(10);

    return services.data;
}