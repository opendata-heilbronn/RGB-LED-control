import {
    REQUEST_DEVICES, RECEIVE_DEVICES, INVALIDATE_DEVICES
} from '../actions/types'

export function devices(state = {
    isFetching: false,
    didInvalidate: true,
    items: []
}, action) {
    switch (action.type) {
        case INVALIDATE_DEVICES:
            return Object.assign({}, state, {
                didInvalidate: true
            });
        case REQUEST_DEVICES:
            return Object.assign({}, state, {
                isFetching: true,
                didInvalidate: false
            });
        case RECEIVE_DEVICES:
            return Object.assign({}, state, {
                isFetching: false,
                didInvalidate: false,
                items: action.items,
                lastUpdated: action.receivedAt
            });
        default:
            return state
    }
}
