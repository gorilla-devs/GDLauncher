import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Progress } from 'antd';
import pMap from 'p-map';
import Modal from '../components/Modal';
import { updateMod } from '../reducers/actions';
import { closeModal } from '../reducers/modals/actions';
import { _getInstance } from '../utils/selectors';

const ModsUpdater = ({ instanceName }) => {
  const dispatch = useDispatch();
  const latestMods = useSelector(state => state.latestModManifests);
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const [computedMods, setComputedMods] = useState(0);
  const [installProgress, setInstallProgress] = useState(null);

  const filterAvailableUpdates = () => {
    return instance.mods.filter(mod => {
      const latestMod = latestMods[mod.projectID]?.find(
        v => v.gameVersion === instance.modloader[1]
      );
      return latestMod && latestMod.projectFileId !== mod.fileID;
    });
  };

  const totalMods = useMemo(() => filterAvailableUpdates(), []);

  const updateMods = async () => {
    await pMap(
      totalMods,
      async mod => {
        const latestMod = latestMods[mod.projectID]?.find(
          v => v.gameVersion === instance.modloader[1]
        );
        await dispatch(
          updateMod(
            instanceName,
            mod,
            latestMod.projectFileId,
            instance.modloader[1],
            p => setInstallProgress(p)
          )
        );
        setComputedMods(p => p + 1);
      },
      { concurrency: 1 }
    );
    dispatch(closeModal());
  };

  useEffect(() => {
    updateMods();
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
