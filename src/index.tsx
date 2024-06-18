/* @refresh reload */
import { render } from "solid-js/web"

import "./index.css"
import App from "./App"
import { Route, Router } from "@solidjs/router";
import { About, Home, NotFound, Profile } from "@/pages";

render(() => (
    <Router root={App}>
        <Route path={["/", "home"]} component={Home} />
        <Route path="/about" component={About} />
        <Route path="/user" component={Profile} />
        <Route path="*404" component={NotFound} />
    </Router>
), document.getElementById("root")!);
