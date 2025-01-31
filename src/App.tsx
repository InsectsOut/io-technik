import { FadeInAnimation } from "@/utils";
import { Navbar, Toast, useToast } from "@/components";
import { Error } from "@/pages";

import PWABadge from './PWABadge.tsx'

import { ErrorBoundary, createSignal, Show, ParentProps } from 'solid-js';
import { useBeforeLeave } from '@solidjs/router';
import { Motion } from 'solid-motionone';

import './App.css'

function App(props: ParentProps) {
  /** Resets the animation state so it shows up on navigation */
  const [visible, setVisible] = createSignal(true);
  const { toasts } = useToast();

  useBeforeLeave(() => {
    setVisible(false);
    setVisible(true);
  });

  return (
    <>
      <Toast toasts={toasts()} />
      <Navbar />
      <Show when={visible()} keyed={true}>
        <Motion.main {...FadeInAnimation}>
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
