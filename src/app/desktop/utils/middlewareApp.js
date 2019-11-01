import { push } from "connected-react-router";

const middleware = store => next => action => {
  const currState = store.getState();
  const result = next(action);
  const nextState = store.getState();
  const { dispatch } = store;

  //   const isAccountManagerModalOpen = nextState.modals.find(
  //     modal => modal.modalType === "AccountsManager"
  //   );
  const currentAccountIdChanged =
    currState.app.currentAccountId !== nextState.app.currentAccountId;

  if (currentAccountIdChanged && !nextState.app.currentAccountId) {
    dispatch(push("/"));
  }

  return result;
};

export default middleware;
