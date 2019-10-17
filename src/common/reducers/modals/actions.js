import { OPEN_MODAL, CLOSE_MODAL, UNMOUNTING_MODAL } from "./actionTypes";

export function openModal(modalType, modalProps = {}) {
  return {
    type: OPEN_MODAL,
    modalType,
    modalProps
  };
}

export function closeModal() {
  return dispatch => {
    dispatch({
      type: UNMOUNTING_MODAL
    });
    setTimeout(
      () =>
        dispatch({
          type: CLOSE_MODAL
        }),
      220
    );
  };
}
