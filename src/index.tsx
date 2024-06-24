/* @refresh reload */
import { render } from "solid-js/web"

import "./index.css"
import App from "./App"
import { Route, Router } from "@solidjs/router";
import { About, Home, Login, NotFound, Profile } from "@/pages";
import { AuthGuard } from "@/components";

render(() => (
    <Router root={App}>
        <Route path="/login" component={Login} />
        <Route path="/" component={AuthGuard}>
            <Route path="/home" component={Home} />
            <Route path="/about" component={About} />
            <Route path="/user" component={Profile} />
        </Route>
        <Route path="*404" component={NotFound} />
    </Router>
), document.getElementById("root")!);
