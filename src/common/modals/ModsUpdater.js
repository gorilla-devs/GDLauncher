import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Progress } from 'antd';
import Modal from '../components/Modal';
import { updateMod } from '../reducers/actions';
import { closeModal } from '../reducers/modals/actions';
import { _getInstance } from '../utils/selectors';

const ModsUpdater = ({ instanceName, mods }) => {
  const dispatch = useDispatch();
  const latestMods = useSelector(state => state.latestModManifests);
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const curseReleaseChannel = useSelector(
    state => state.settings.curseReleaseChannel
  );
  const [computedMods, setComputedMods] = useState(0);
  const [modsToCompute, setModsToCompute] = useState(0);
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
    const updateAllMods = async () => {
      let i = 0;
      while (!cancel && i < totalMods.length) {
        const mod = totalMods[i];
        await dispatch(
          updateMod(
            instanceName,
            mod,
            latestMods[mod.projectID].id,
            instance.modloader[1],
            // eslint-disable-next-line
            p => {
              if (!cancel) setInstallProgress(p);
            }
          )
        );
        if (!cancel) {
          setComputedMods(p => p + 1);
        }
        i += 1;
      }
      if (!cancel) {
        dispatch(closeModal());
      }
    };

    const updateSelectedMods = async filteredMods => {
      let i = 0;
      while (!cancel && i < filteredMods.length) {
        const fileName = filteredMods[i];
        const item = totalMods.find(x => x.fileName === fileName);

        if (item) {
          const isUpdateAvailable =
            latestMods[item.projectID] &&
            latestMods[item.projectID].id !== item.fileID &&
            latestMods[item.projectID].releaseType <= curseReleaseChannel;

          if (isUpdateAvailable) {
            await dispatch(
              updateMod(
                instanceName,
                item,
                latestMods[item.projectID].id,
                instance.modloader[1],
                // eslint-disable-next-line
                p => {
                  if (!cancel) setInstallProgress(p);
                }
              )
            );
          }
        }
        if (!cancel) {
          setComputedMods(p => p + 1);
        }
        i += 1;
      }
      if (!cancel) {
        dispatch(closeModal());
      }
    };

    if (mods.length >= 1) {
      // eslint-disable-next-line array-callback-return
      const updetableMods = mods.filter(x => {
        const item = totalMods.find(y => y.fileName === x);
        if (item) {
          const isUpdateAvailable =
            latestMods[item.projectID] &&
            latestMods[item.projectID].id !== item.fileID &&
            latestMods[item.projectID].releaseType <= curseReleaseChannel;

          return isUpdateAvailable;
        }
      });

      setModsToCompute(updetableMods.length);
      updateSelectedMods(updetableMods);
    } else {
      setModsToCompute(mods.length >= 1 ? mods.length : totalMods.length);
      updateAllMods();
    }
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
        Updating mod {computedMods} /{modsToCompute}
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
