/**
 * Action types
 *
 * *ACTION VERB*_*NOUN*
 */
export const CHANGE_ORIGIN_INPUT = 'CHANGE_ORIGIN_INPUT';
export const CHANGE_DESTINATION_INPUT = 'CHANGE_DESTINATION_INPUT';
export const UPDATE_ORIGIN_PREDICTIONS = 'UPDATE_ORIGIN_PREDICTIONS';
export const UPDATE_DESTINATION_PREDICTIONS = 'UPDATE_DESTINATION_PREDICTIONS';

/**
 * Action creators
 */
export function changeOriginInput(value) {
    return {
        type: CHANGE_ORIGIN_INPUT,
        value
    };
}

export function changeDestinationInput(value) {
    return {
        type: CHANGE_DESTINATION_INPUT,
        value
    };
}

export function updateOriginPredictions(origins) {
    return {
        type: UPDATE_ORIGIN_PREDICTIONS,
        origins
    };
}

export function updateDestinationPredictions(destinations) {
    return {
        type: UPDATE_DESTINATION_PREDICTIONS,
        destinations
    };
}
