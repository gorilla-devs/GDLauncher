import React, { useState, useEffect, memo } from 'react';
import styled from 'styled-components';
import { promises as fs } from 'fs';
import { useSelector } from 'react-redux';
import { ipcRenderer } from 'electron';
import path from 'path';
import { _getInstances } from '../../../../common/utils/selectors';
import Instance from './Instance';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  width: 100%;
`;

const NoInstance = styled.div`
  width: 100%;
  text-align: center;
  font-size: 25px;
  margin-top: 100px;
`;

const SubNoInstance = styled.div`
  width: 100%;
  text-align: center;
  font-size: 15px;
  margin-top: 20px;
`;

const Instances = () => {
  const instances = useSelector(_getInstances);
  const [showOldGDHelp, setShowOldGDHelp] = useState(null);

  const checkOldInstances = async () => {
    const appData = await ipcRenderer.invoke('getAppdataPath');

    try {
      await fs.stat(
        path.resolve(
          appData,
          '../',
          'Local',
          'Programs',
          'gdlauncher',
          'GDLauncher.exe'
        )
      );
      setShowOldGDHelp(true);
    } catch {
      setShowOldGDHelp(false);
    }
  };

  useEffect(() => {
    checkOldInstances();
  }, []);

  return (
    <Container>
      {instances.length > 0 ? (
        instances.map(i => <Instance key={i.name} instanceName={i.name} />)
      ) : (
        <NoInstance>
          No Instance has been installed
          <SubNoInstance>
            {showOldGDHelp === true && (
              <div>
                Where did my old instances go? <br /> Click{' '}
                <a href="https://github.com/gorilla-devs/GDLauncher/wiki/Instances-Upgrade-Guide">
                  here
                </a>{' '}
                for more info
              </div>
            )}
            {showOldGDHelp === false && (
              <div>
                Click on the icon in the bottom left corner to add new instances
              </div>
            )}
          </SubNoInstance>
        </NoInstance>
      )}
    </Container>
  );
};

export default memo(Instances);
