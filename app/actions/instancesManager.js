export const SELECT_INSTANCE = 'SELECT_INSTANCE';

export function selectInstance(name) {
  return (dispatch) => {
    dispatch({
      type: SELECT_INSTANCE,
      payload: name
    });
  };
}
