import React from 'react';
import { Route } from 'react-router';

function RouteWithSubRoutes(route) {
  return (
    <Route
      // eslint-disable-next-line react/destructuring-assignment
      path={route.path}
      render={props => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <route.component {...props} routes={route.routes} />
      )}
    />
  );
}

export default RouteWithSubRoutes;
