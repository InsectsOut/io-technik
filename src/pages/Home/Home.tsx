import { createSignal } from 'solid-js'

import "./Home.css";
import { userStore as user } from "@/state/User";

export function Home() {
  const [count, setCount] = createSignal(0);
  const double = () => count() * 2;

  return (
    <>
      <h1>io-technik</h1>
      <div class="card">
        <button type="button" class="button is-link is-small" onClick={() => setCount((count) => count + 1)}>
          count is {count()}
        </button>
        <button type="button" class="button is-danger is-small is-outlined" onClick={() => setCount((count) => count + 1)}>
          count x2 is {double()}
        </button>
        <label for="home-input">Escribe tu nombre de usuario: </label>
        <input id="home-input" type="text"
          value={user.firstname}
          onInput={(e) => user.firstname = e.target.value}
        />
      </div>
    </>
  )
}
