import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Progress } from 'antd';
import path from 'path';
import fse from 'fs-extra';
import Modal from '../components/Modal';
import { updateMod } from '../reducers/actions';
import { closeModal } from '../reducers/modals/actions';
import {
  _getInstance,
  _getInstancesPath,
  _getTempPath
} from '../utils/selectors';
import { makeModRestorePoint } from '../utils';

const ModsUpdater = ({ instanceName }) => {
  const dispatch = useDispatch();
  const latestMods = useSelector(state => state.latestModManifests);
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const curseReleaseChannel = useSelector(
    state => state.settings.curseReleaseChannel
  );
  const [computedMods, setComputedMods] = useState(0);
  const [installProgress, setInstallProgress] = useState(null);

  const filterAvailableUpdates = () => {
    return instance.mods.filter(mod => {
      return (
        latestMods[mod.projectID] &&
        latestMods[mod.projectID].id !== mod.fileID &&
        latestMods[mod.projectID].releaseType <= curseReleaseChannel
      );
    });
  };

  const totalMods = useMemo(() => filterAvailableUpdates(), []);

  const tempPath = useSelector(_getTempPath);
  const instancesPath = useSelector(_getInstancesPath);
  const instancePath = path.join(instancesPath, instanceName);
  const modsPath = path.join(instancePath, 'mods');

  useEffect(() => {
    let cancel = false;
    const updateMods = async () => {
      let i = 0;
      while (!cancel && i < totalMods.length) {
        const mod = totalMods[i];
        const restoreModPath = path.join(tempPath, `${mod.fileName}__RESTORE`);
        await makeModRestorePoint(restoreModPath, modsPath, mod.fileName);

        await dispatch(
          updateMod(
            instanceName,
            mod,
            latestMods[mod.projectID].id,
            instance.loader?.mcVersion,
            // eslint-disable-next-line
            p => {
              if (!cancel) setInstallProgress(p);
            }
          )
        );
        if (!cancel) {
          await fse.remove(restoreModPath);
          setComputedMods(p => p + 1);
        }
        i += 1;
      }
      if (!cancel) {
        dispatch(closeModal());
      }
    };

    updateMods();
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <Modal
      css={`
        height: 160px;
        width: 350px;
      `}
      title="Mods Updater"
    >
      <Container>
        Updating mod {computedMods} / {totalMods.length}
        {installProgress !== null && (
          <Progress percent={parseInt(installProgress, 10)} />
        )}
      </Container>
    </Modal>
  );
};

export default ModsUpdater;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-content: space-between;
  justify-content: center;
  text-align: center;
  font-size: 20px;
`;
