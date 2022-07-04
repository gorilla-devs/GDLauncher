import React, { Suspense } from 'react';

function WaitingComponent(MyComponent) {
  return props => (
    <Suspense fallback={null}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <MyComponent {...props} />
    </Suspense>
  );
}

export default WaitingComponent;
