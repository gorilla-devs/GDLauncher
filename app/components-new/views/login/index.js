import React from 'react';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import { Button } from 'ui';

export default () => {
  const dispatch = useDispatch();
  return (
    <div>
      <Button onClick={() => dispatch(push('/home'))}>Login</Button>
    </div>
  );
};
