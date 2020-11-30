import { push } from 'connected-react-router';

const middlewareApp = store => next => action => {
  const currState = store.getState();
  const result = next(action);
  const nextState = store.getState();
  const { dispatch } = store;

  const currentAccountIdChanged =
    currState.currentAccountId !== nextState.currentAccountId;

  if (currentAccountIdChanged && !nextState.currentAccountId) {
    dispatch(push('/'));
  }

  if (currState.potatoPcMode !== nextState.potatoPcMode) {
    if (nextState.potatoPcMode) {
      document.getElementById('root').classList.add('disable-animations');
    } else {
      document.getElementById('root').classList.remove('disable-animations');
    }
  }

  return result;
};

export default middlewareApp;
