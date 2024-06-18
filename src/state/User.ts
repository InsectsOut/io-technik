import { createMutable } from "solid-js/store";

type User = {
    role: "admin" | "user",
    firstname: string,
    lastname: string,
    id: string
}

const userStore = createMutable<User>({
    role: "admin",
    firstname: "Eduardo",
    lastname: "Larios Fernandez",
    id: "001"
});

export { userStore };