import React, { memo } from 'react';
import ReactDOM from 'react-dom';
import Renderer from './renderer';

const MainRoot = memo(() => {
  return <Renderer />;
});

ReactDOM.render(<MainRoot />, document.getElementById('root'));
