import css from "./Profile.module.css";
import { For, Show } from "solid-js";
import { userProfile } from "@/state/Profile";

export function Profile() {
    return (
        <div class={css.container}>
            <h1>User profile</h1>
            <div class={css.username}>
                <br />
                <Show when={userProfile()}>
                    <For each={Object.entries(userProfile()!)}>
                        {([key, val]) => <div>{`${key}: ${val}`}</div>}
                    </For>
                </Show>
            </div>
        </div>
    );
}