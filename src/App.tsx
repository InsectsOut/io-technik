import { FadeOutAnimation } from "@/utils";
import PWABadge from './PWABadge.tsx'
import { Navbar } from "@/components";
import { Error } from "@/pages";

import { ErrorBoundary, createSignal, Show, ParentProps, onMount } from 'solid-js';
import { useBeforeLeave } from '@solidjs/router';
import { Motion } from 'solid-motionone';

import './App.css'

// Animation options for MotionOne
const { animate, exit, transition } = FadeOutAnimation;

function App(props: ParentProps) {
  /** Resets the animation state so it shows up on navigation */
  const [visible, setVisible] = createSignal(true);

  useBeforeLeave(() => {
    setVisible(false);
    setVisible(true);
  });

  onMount(async () => {
    /** Mounts eruda mobile dev tools if the qsp `debug=true` is set */
    const params = new URLSearchParams(location.search);
    if (params.has("debug", "true")) {
      const eruda = await import("eruda");
      eruda.default.init({ autoScale: true });
    }
  });

  return (
    <>
      <Navbar />
      <Show when={visible()}>
        <Motion.main
          transition={transition}
          animate={animate}
          exit={exit}
        >
          <ErrorBoundary fallback={Error}>
            {props.children}
          </ErrorBoundary>
        </Motion.main>
      </Show>
      <PWABadge />
    </>
  );
}

export default App;
