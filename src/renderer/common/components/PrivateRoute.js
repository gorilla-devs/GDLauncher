/* eslint-disable react/jsx-props-no-spreading */
import React, { memo } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from './ProvideAuth';

const PrivateRoute = ({ children, ...rest }) => {
  const auth = useAuth();
  console.log('auth', auth);
  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.user ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location }
            }}
          />
        )
      }
    />
  );
};

export default memo(PrivateRoute);
