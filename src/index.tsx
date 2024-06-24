/* @refresh reload */
import { render } from "solid-js/web"

import "./index.css"
import App from "./App"
import { Route, Router } from "@solidjs/router";
import { AuthGuard } from "@/components";
import { Login, Home, About, Profile, NotFound } from "@/pages";

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
