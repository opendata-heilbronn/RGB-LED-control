import { UPDATE_NOTIFICATION } from '../actions/types'

export function notification(state = {message: ""}, action) {
    switch (action.type) {
        case UPDATE_NOTIFICATION:
            return state = {message: action.message};
        default:
            return state
    }
}
