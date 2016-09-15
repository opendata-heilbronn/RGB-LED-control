import React from "react";
import {Route} from "react-router";
import HtmlSkeletal from "./HtmlSkeletal";
import DevicesPage from "./pages/DevicesPage";

export default (
    <Route path="/" component={HtmlSkeletal}>
        <Route path="devices" component={DevicesPage}/>
    </Route>
);