import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Progress } from 'antd';
import Modal from '../components/Modal';
import { closeModal } from '../reducers/modals/actions';
import { _getInstance } from '../utils/selectors';
import sendMessage from '../utils/sendMessage';
import EV from '../messageEvents';

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

  useEffect(() => {
    let cancel = false;
    const updateMods = async () => {
      let i = 0;
      while (!cancel && i < totalMods.length) {
        const mod = totalMods[i];
        await sendMessage(EV.UPDATE_MOD, [
          instanceName,
          mod,
          latestMods[mod.projectID].id,
          instance.modloader[1],
          // eslint-disable-next-line
          p => {
            if (!cancel) setInstallProgress(p);
          }
        ]);
        if (!cancel) {
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
