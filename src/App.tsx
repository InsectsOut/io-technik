import PWABadge from './PWABadge.tsx'
import { Navbar } from "@/components";
import { Error } from "@/pages";

import { ErrorBoundary, createSignal, Show, ParentProps, onMount } from 'solid-js';
import { useBeforeLeave } from '@solidjs/router';
import { Motion, Options as MotionOptions } from 'solid-motionone';

import './App.css'

/** Animation options for Motion */
const Animation: MotionOptions = {
  animate: { opacity: [0, 1] },
  exit: { opacity: [1, 0] },
  transition: {
    easing: "ease-in-out",
    duration: 0.7,
  }
};

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
          transition={Animation.transition}
          animate={Animation.animate}
          exit={Animation.exit}
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
