import React, { memo } from 'react';
import Navbar from './components/Navbar';

const BrowserRoot = () => {
  return (
    <div>
      <Navbar />
      <div>Browser</div>
    </div>
  );
};

export default memo(BrowserRoot);
