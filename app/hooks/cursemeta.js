import React, { useState, useEffect } from 'react';
import log from 'electron-log';
import { getAddon } from '../utils/cursemeta';

export const useGetAddon = addonID => {
  const [response, setResponse] = useState(null);
  useEffect(() => {
    getAddon(addonID).then(data => setResponse(data));
  }, []);
  return response;
};
