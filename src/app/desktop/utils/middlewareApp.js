import { push } from 'connected-react-router';

const middleware = store => next => action => {
  const currState = store.getState();
  const result = next(action);
  const nextState = store.getState();
  const { dispatch } = store;

  const currentAccountIdChanged =
    currState.app.currentAccountId !== nextState.app.currentAccountId;

  if (currentAccountIdChanged && !nextState.app.currentAccountId) {
    dispatch(push('/'));
  }

  if (currState.settings.potatoPcMode !== nextState.settings.potatoPcMode) {
    if (nextState.settings.potatoPcMode) {
      document.getElementById('root').classList.add('disable-animations');
    } else {
      document.getElementById('root').classList.remove('disable-animations');
    }
  }

  return result;
};

export default middleware;
