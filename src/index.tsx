import "solid-devtools";

import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Route, Router } from "@solidjs/router";
import { render } from "solid-js/web";

import { Login, NotFound } from "@/pages";
import { AuthGuard } from "@/components";
import App from "./App";

import "./index.css";
import { lazy } from "solid-js";

const client = new QueryClient();
const Home = lazy(() => import("@/pages/Home"));
const Profile = lazy(() => import("@/pages/Profile"));
const Feedback = lazy(() => import("@/pages/Feedback"));
const Service = lazy(() => import("@/pages/Service"));
const About = lazy(() => import("@/pages/About"));

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
