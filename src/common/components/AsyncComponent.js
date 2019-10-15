import React, { Suspense } from "react";

function WaitingComponent(MyComponent) {
  return props => (
    <Suspense fallback={null}>
      <MyComponent {...props} />
    </Suspense>
  );
}

export default WaitingComponent;
