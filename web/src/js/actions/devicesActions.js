import axios from "axios";
import {INVALIDATE_DEVICES, RECEIVE_DEVICES, REQUEST_DEVICES} from './types';
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
        const socket = io('http://localhost:3000/');
        socket.on('devices', (data) => {
            dispatch(receive(data));
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