import {combineReducers} from "redux";
import {notification} from "./notificationReducer";
import {devices} from "./devicesReducer";

const rootReducer = combineReducers({
    notification, devices
});

export default rootReducer;