"use strict";
import React from "react";
import DevicesTestList from "../components/DevicesTestList";
import DeviceControl from "../components/DeviceControl";

const DevicesPage = () => {
    return (
        <div>
            <DevicesTestList />
            <DeviceControl />
        </div>
    )
};

export default DevicesPage;