import React from 'react';

const RouteBackground = () => {
  return (
    <div
      css={`
        position: absolute;
        background: ${props => props.theme.palette.secondary.main};
        width: 100%;
        height: 100%;
        z-index: -1;
      `}
    />
  );
};

export default RouteBackground;
