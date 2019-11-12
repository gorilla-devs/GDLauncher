const createThunkSubscribeEnhancer = extraArgument => {
  return createStore => {
    return (reducer, initialState) => {
      const store = createStore(reducer, initialState);
      const { dispatch } = store;
      store.dispatch = action => {
        if (typeof action === "function") {
          return action(
            store.dispatch,
            store.getState,
            store.subscribe,
            extraArgument
          );
        }
        return dispatch(action);
      };
      return store;
    };
  };
};

const thunkSubscribeEnhancer = createThunkSubscribeEnhancer();
thunkSubscribeEnhancer.withExtraArgument = createThunkSubscribeEnhancer;

export default thunkSubscribeEnhancer;
