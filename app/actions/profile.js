export const SET_STATE_ONLINE = 'SET_STATE_ONLINE';
export const SET_STATE_AWAY = 'SET_STATE_AWAY';
export const SET_STATE_BUSY = 'SET_STATE_BUSY';

export function setStateToOnline() {
  return (dispatch) => {
    dispatch({
      type: SET_STATE_ONLINE
    });
  };
}

export function setStateToAway() {
  return (dispatch) => {
    dispatch({
      type: SET_STATE_AWAY
    });
  };
}

export function setStateToBusy() {
  return (dispatch) => {
    dispatch({
      type: SET_STATE_BUSY
    });
  };
}