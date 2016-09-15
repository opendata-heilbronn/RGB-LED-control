import axios from "axios";
import {INVALIDATE_DEVICES, RECEIVE_DEVICES, REQUEST_DEVICES} from './types';
import {showNotification} from './notificationActions';
import io from 'socket.io-client';

export function invalidate() {
    return {
        type: INVALIDATE_DEVICES
    }
}

function request() {
    return {
        type: REQUEST_DEVICES
    }
}

function receive(json) {
    return {
        type: RECEIVE_DEVICES,
        items: json,
        receivedAt: Date.now()
    }
}

function fetch() {
    return dispatch => {
        dispatch(request());
        const socket = io('http://' + window.location.hostname + ':3000/');
        socket.on('connect', () => {console.log('connected to socket.io')});
        socket.on('devices', (data) => {
            console.log('received socket.io devices update', data);
            dispatch(receive(data));
        });
        socket.on('deviceUpdate', (data) => {
            console.log('received socket.io device update', data);
            dispatch(showNotification(`${data.key} ist nun ${data.status}`));
        });
        return axios.get('/api/devices')
            .then(response => dispatch(receive(response.data)))
    }
}

function shouldFetch(state) {
    const devicesState = state.devices;
    if (!devicesState) {
        return true
    } else if (devicesState.isFetching) {
        return false
    } else {
        return devicesState.didInvalidate
    }
}

export function fetchIfNeeded() {
    return (dispatch, getState) => {
        if (shouldFetch(getState())) {
            return dispatch(fetch())
        }
    }
}
