import React from 'react';
import { Cascader } from 'antd';
import styled from 'styled-components';
import fss from 'fs-extra';
import { useSelector, useDispatch } from 'react-redux';
import path from 'path';
import Modal from '../components/Modal';
import { addToQueue } from '../reducers/actions';
import { _getInstancesPath, _getInstance } from '../utils/selectors';
import { closeModal } from '../reducers/modals/actions';
import { FABRIC, VANILLA, FORGE } from '../utils/constants';
import { filteredVersions } from '../../app/desktop/utils';

const McVersionChanger = ({ instanceName }) => {
  const vanillaManifest = useSelector(state => state.app.vanillaManifest);
  const fabricManifest = useSelector(state => state.app.fabricManifest);
  const forgeManifest = useSelector(state => state.app.forgeManifest);
  const config = useSelector(state => _getInstance(state)(instanceName));
  const instancePath = useSelector(state =>
    path.join(_getInstancesPath(state), instanceName)
  );

  const dispatch = useDispatch();

  const filteredVers = filteredVersions(
    vanillaManifest,
    forgeManifest,
    fabricManifest
  );

  return (
    <Modal
      title="Minecraft Version Changer"
      css={`
        height: 380px;
        width: 600px;
      `}
    >
      <Container>
        <Cascader
          options={filteredVers}
          onChange={async v => {
            const isVanilla = v[0] === VANILLA;
            const isFabric = v[0] === FABRIC;
            const isForge = v[0] === FORGE;
            if (isVanilla) {
              dispatch(addToQueue(instanceName, [v[0], v[2]]));
            } else if (isForge) {
              try {
                const manifest = await fss.readJson(
                  path.join(instancePath, 'manifest.json')
                );

                dispatch(
                  addToQueue(
                    instanceName,
                    v,
                    manifest,
                    `background${path.extname(config?.background)}`
                  )
                );
              } catch (e) {
                console.error(e);
                dispatch(addToQueue(instanceName, v));
              }
            } else if (isFabric) {
              const mappedItem = fabricManifest.mappings.find(
                ver => ver.version === v[2]
              );
              const splitItem = v[2].split(mappedItem.separator);
              dispatch(
                addToQueue(instanceName, ['fabric', splitItem[0], v[2], v[3]])
              );
            }

            dispatch(closeModal());
            setTimeout(() => dispatch(closeModal()), 200);
          }}
          placeholder="Select a version"
          size="large"
          css={`
            width: 400px;
          `}
        />
      </Container>
    </Modal>
  );
};

export default McVersionChanger;

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
