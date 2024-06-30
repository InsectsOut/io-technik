/* @refresh reload */
import { render } from "solid-js/web"

import "./index.css"
import App from "./App"
import { Route, Router } from "@solidjs/router";
import { AuthGuard } from "@/components";
import { Login, Home, About, Profile, NotFound, Feedback, Pages } from "@/pages";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

const client = new QueryClient();

render(() => (
    <QueryClientProvider client={client}>
        <Router root={App}>
            <Route path={Pages.Login} component={Login} />
            <Route path={Pages.Root} component={AuthGuard}>
                <Route path={Pages.About} component={About} />
                <Route path={Pages.Feedback} component={Feedback} />
                <Route path={[Pages.Home, Pages.Root]} component={Home} />
                <Route path={Pages.User} component={Profile} />
            </Route>
            <Route path={Pages.NotFound} component={NotFound} />
        </Router>
    </QueryClientProvider>
), document.getElementById("root")!);
