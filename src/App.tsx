import PWABadge from './PWABadge.tsx'
import { AuthGuard, Footer, Navbar } from "@/components";
import { About, Error, Home, Login, NotFound, Profile } from "@/pages";

import { ErrorBoundary, createSignal, Show } from 'solid-js';
import { Route, Router, useBeforeLeave } from '@solidjs/router';
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

function App() {
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
            <Router>
              <Route path="/login" component={Login} />
              <Route path="/" component={AuthGuard}>
                <Route path="/home" component={Home} />
                <Route path="/about" component={About} />
                <Route path="/user" component={Profile} />
              </Route>
              <Route path="*404" component={NotFound} />
            </Router>
          </Motion.main>
        </Show>
      </ErrorBoundary>
      <Footer />
      <PWABadge />
    </>
  );
}

export default App;
