import * as ActionTypes from './actionTypes';

export default function modals(state = [{ modalType: 'Modal1', modalProps: {} }], action) {

  switch (action.type) {
    case ActionTypes.OPEN_MODAL:
      return state.concat({
        modalType: action.modalType,
        modalProps: action.modalProps
      });
    case ActionTypes.CLOSE_MODAL:
      return state.slice(0, state.length - 1);
    default:
      return state;
  }
}
