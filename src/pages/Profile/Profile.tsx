import { userStore as user } from "@/state/User";
import css from "./Profile.module.css";

export function Profile() {
    return (
        <div class={css.container}>
            <h1>User profile</h1>
            <div class={css.username}>
                {user.firstname} {user.lastname}
            </div>
        </div>
    );
}