import {UPDATE_NOTIFICATION} from './types';

export function showNotification(message) {
    return {
        type: UPDATE_NOTIFICATION,
        message
    }
}

export function showErrorNotification(message) {
    if (!message) message = 'Fehler aufgetreten. Bitte nochmal versuchen';
    return showNotification(message);
}

export function hideNotification() {
    return showNotification('');
}