import PWABadge from './PWABadge.tsx'
import { Navbar } from './components/Navbar.tsx';

import './App.css'
import { Footer } from './components/Footer.tsx';
import { ParentProps } from 'solid-js';

function App(props: ParentProps) {
  return (
    <>
      <Navbar />
      {props.children}
      <Footer />
      <PWABadge />
    </>
  )
}

export default App;
