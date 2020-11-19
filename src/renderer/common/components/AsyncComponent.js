import React, { Suspense } from 'react';

function AsyncComponent(MyComponent) {
  return props => (
    <Suspense fallback={null}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <MyComponent {...props} />
    </Suspense>
  );
}

export default AsyncComponent;
