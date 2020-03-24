import React from 'react';

const withScroll = Component => {
  return props => {
    return (
      <div
        css={`
          flex-grow: 1;
          overflow-y: auto;
          padding: 10px 0;
        `}
      >
        <div
          css={`
            flex-grow: 1;
            display: flex;
            justify-content: center;
          `}
        >
          <div
            css={`
              width: 1000px;
            `}
          >
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <Component {...props} />
          </div>
        </div>
      </div>
    );
  };
};

export default withScroll;
