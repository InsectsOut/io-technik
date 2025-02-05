import { FadeInAnimation } from "@/utils";
import { Navbar, Toast, useToast } from "@/components";
import { Error } from "@/pages";

import PWABadge from './PWABadge.tsx'

import { ErrorBoundary, ParentProps } from 'solid-js';
import { useBeforeLeave } from "@solidjs/router";
import { Motion } from 'solid-motionone';

import './App.css'

export default function App(props: ParentProps) {
  /** Resets the animation state so it shows up on navigation */
  const { toasts } = useToast();
  let mainRef: Maybe<HTMLElement>;

  useBeforeLeave((navEvent) => {
    navEvent.preventDefault();
    const animation = mainRef!.animate(
      [{ opacity: 1 }, { opacity: 0 }],
      { duration: 350, easing: 'ease-in-out' }
    );

    animation.onfinish = () => {
      navEvent.retry(true);
    };
  });

  return (
    <>
      <Toast toasts={toasts()} />
      <Navbar />
      <Motion.main {...FadeInAnimation} ref={mainRef!}>
        <ErrorBoundary fallback={Error}>
          {props.children}
        </ErrorBoundary>
      </Motion.main>
      <PWABadge />
    </>
  );
}