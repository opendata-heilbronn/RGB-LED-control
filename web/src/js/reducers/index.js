import {combineReducers} from "redux";
import {notification} from "./notificationReducer";

const rootReducer = combineReducers({
    notification
});

export default rootReducer;