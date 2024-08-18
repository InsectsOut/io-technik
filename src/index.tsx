/* @refresh reload */
import { render } from "solid-js/web"

import "./index.css"
import App from "./App"
import { Route, Router } from "@solidjs/router";
import { AuthGuard } from "@/components";
import { Login, Home, About, Profile, NotFound, Feedback, Service } from "@/pages";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

const client = new QueryClient();

render(() => (
    <QueryClientProvider client={client}>
        <Router root={App}>
            <Route path="/login" component={Login} />
            <Route path="/" component={AuthGuard}>
                <Route path="/about" component={About} />
                <Route path="/feedback" component={Feedback} />
                <Route path="/services/:folio" component={Service} />
                <Route path={["/home", "/"]} component={Home} />
                <Route path="/user" component={Profile} />
            </Route>
            <Route path="*404" component={NotFound} />
        </Router>
    </QueryClientProvider>
), document.getElementById("root")!);
