import PWABadge from './PWABadge.tsx'
import { Footer, Navbar } from "@/components";

import './App.css'
import { ParentProps } from 'solid-js';

function App(props: ParentProps) {
  return (
    <>
      <Navbar />
      {props.children}
      <Footer />
      <PWABadge />
    </>
  );
}

export default App;
