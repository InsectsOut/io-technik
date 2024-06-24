import PWABadge from './PWABadge.tsx'
import { Footer, Navbar } from "@/components";
import { Error } from "@/pages";

import { ParentProps, ErrorBoundary, createSignal, Show } from 'solid-js';
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

  return (
    <>
      <Navbar />
      <ErrorBoundary fallback={Error}>
        <Show when={visible()}>
          <Motion.main
            transition={Animation.transition}
            animate={Animation.animate}
            exit={Animation.exit}
          >
            {props.children}
          </Motion.main>
        </Show>
      </ErrorBoundary>
      <Footer />
      <PWABadge />
    </>
  );
}

export default App;
