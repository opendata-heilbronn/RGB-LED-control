import React from "react";
import Header from "./components/Header";
import Notification from "./components/utils/Notification";

const HtmlSkeletal = ({children}) => (
    <div>
        <Header />
        <Notification />
        <div className="main">{children}</div>
    </div>
);

export default HtmlSkeletal;