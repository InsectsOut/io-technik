import "solid-devtools";

import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";

import { About, Feedback, Home, Login, NotFound, Profile, Service } from "@/pages";
import { AuthGuard } from "@/components";
import { Auth } from "./supabase";
import App from "./App";

import "./index.css";

const client = new QueryClient();
await Auth.initSession();

render(() => (
    <QueryClientProvider client={client}>
        <Router root={App}>
            <Route path="/login" component={Login} />
            <Route path="/" component={AuthGuard}>
                <Route path="/about" component={About} />
                <Route path="/feedback" component={Feedback} />
                <Route path="/services/:org/:folio/:tab?" component={Service} />
                <Route path={["/home", "/"]} component={Home} />
                <Route path="/user" component={Profile} />
            </Route>
            <Route path="*404" component={NotFound} />
        </Router>
    </QueryClientProvider>
), document.getElementById("root")!);
