import { createSignal } from 'solid-js'

import "./Home.css";

export function Home() {
  const [count, setCount] = createSignal(0);
  const double = () => count() * 2;

  return (
    <>
      <h1>io-field-app</h1>
      <div class="card">
        <button type="button" class="button is-link is-small" onClick={() => setCount((count) => count + 1)}>
          count is {count()}
        </button>
        <button type="button" class="button is-danger is-small is-outlined" onClick={() => setCount((count) => count + 1)}>
          count x2 is {double()}
        </button>
      </div>
    </>
  )
}
