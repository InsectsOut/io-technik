/* @refresh reload */
import { render } from "solid-js/web"

import "./index.css"
import App from "./App"
import { Router } from "@solidjs/router";

render(() => (
    <Router root={App} />
), document.getElementById("root")!);
