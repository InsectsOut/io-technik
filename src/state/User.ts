import { supabase } from "@/supabase";
import { createMutable } from "solid-js/store";

type User = {
    role: "admin" | "user",
    firstname: string,
    lastname: string,
    email: string,
    id: string
}

export function getUserData() {
    supabase.auth.getUser().then(({ data, error }) => {
        if (data.user) {
            const { email, id } = data.user;
            userStore.email = email || "no-email";
            userStore.id = id;
        } else {
            console.error(error);
        }
    })
}

const userStore = createMutable<User>({
    role: "admin",
    firstname: "Eduardo",
    lastname: "Larios Fernandez",
    email: "eduardo-larios@outlook.com",
    id: "001"
});

export { userStore };