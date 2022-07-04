import * as ActionTypes from './actionTypes';

export default function modals(state = [], action) {
  switch (action.type) {
    case ActionTypes.OPEN_MODAL:
      if (!state.find(x => x.modalType === action.modalType)) {
        return state.concat({
          modalType: action.modalType,
          modalProps: action.modalProps
        });
      }
      console.warn('A modal of the same type already exists!');
      return state;
    case ActionTypes.UPDATE_MODAL:
      return action.modals;
    case ActionTypes.UNMOUNTING_MODAL:
      if (state.length > 0) {
        return [
          ...state.slice(0, state.length - 1),
          {
            ...state[state.length - 1],
            unmounting: true
          }
        ];
      }
      return state;
    case ActionTypes.CLOSE_MODAL:
      if (state.length > 0) {
        return state.slice(0, state.length - 1);
      }
      return state;
    default:
      return state;
  }
}
