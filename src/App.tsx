import PWABadge from './PWABadge.tsx'
import { Footer, Navbar } from "@/components";
import { Error } from "@/pages";

import './App.css'
import { ParentProps, ErrorBoundary } from 'solid-js';

function App(props: ParentProps) {
  return (
    <>
      <Navbar />
      <ErrorBoundary fallback={Error}>
        {props.children}
      </ErrorBoundary>
      <Footer />
      <PWABadge />
    </>
  );
}

export default App;
