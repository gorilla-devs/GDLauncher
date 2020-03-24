import * as ActionTypes from './actionTypes';

export default function modals(state = [], action) {
  switch (action.type) {
    case ActionTypes.OPEN_MODAL:
      return state.concat({
        modalType: action.modalType,
        modalProps: action.modalProps
      });
    case ActionTypes.UPDATE_MODAL:
      return action.modals;
    case ActionTypes.UNMOUNTING_MODAL:
      return [
        ...state.slice(0, state.length - 1),
        {
          ...state[state.length - 1],
          unmounting: true
        }
      ];
    case ActionTypes.CLOSE_MODAL:
      return state.slice(0, state.length - 1);
    default:
      return state;
  }
}
