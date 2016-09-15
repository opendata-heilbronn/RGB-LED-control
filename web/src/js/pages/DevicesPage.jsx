"use strict";
import React from "react";
import DevicesTestList from "../components/DevicesTestList";
import DeviceControl from "../components/DeviceControl";
import StartStopControl from "../components/StartStopControl";

const DevicesPage = () => {
    return (
        <div>
            <DevicesTestList />
            <StartStopControl />
            <DeviceControl />
        </div>
    )
};

export default DevicesPage;