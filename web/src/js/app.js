import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import { Router, browserHistory } from 'react-router'
import {createStore, applyMiddleware} from "redux";
import thunk from "redux-thunk";
import {Provider} from "react-redux";
import rootReducer from "./reducers/index";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import injectTapEventPlugin from "react-tap-event-plugin";
import routes from './routes';

injectTapEventPlugin();
const store = createStore(rootReducer, applyMiddleware(thunk));
const App = () => (
    <MuiThemeProvider>
        <Provider store={store}>
            <Router history={browserHistory}>
                {routes}
            </Router>
        </Provider>
    </MuiThemeProvider>
);

ReactDOM.render(
    <App />,
    document.getElementById('app')
);