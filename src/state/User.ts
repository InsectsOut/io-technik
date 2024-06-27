import { createMutable } from "solid-js/store";

type User = {
    role: "admin" | "user",
    firstname: string,
    lastname: string,
    email: string,
    id: string
}

const userStore = createMutable<User>({
    role: "admin",
    firstname: "Eduardo",
    lastname: "Larios Fernandez",
    email: "eduardo-larios@outlook.com",
    id: "001"
});

export { userStore };