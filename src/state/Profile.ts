import { IO_Database, supabase, Tables } from "@/supabase";
import { createSignal } from "solid-js";

/**
 * Fetches an Insects Out employee profile
 * @returns A `promise` the resolves to a `Empleado`, null otherwise
*/
export async function fetchUserProfile(userId: string): Promise<Profile | null> {
    const { data } = await IO_Database
        .from("Empleados")
        .select("*")
        .filter("user_id", "eq", userId)
        .limit(1)
        .single();

    return data;
}

export type Profile = Tables<"Empleados">;

export const [employeeProfile, setProfile] = createSignal<Profile | null>(null);

supabase.auth.onAuthStateChange((_, session) => {
    const userId = session?.user.id;
    if (userId) {
        fetchUserProfile(userId)
            .then(setProfile)
            .catch(console.error)
    } else {
        setProfile(null);
    }
});