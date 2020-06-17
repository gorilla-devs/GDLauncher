import React, { useMemo } from 'react';
import { Cascader } from 'antd';
import styled from 'styled-components';
import fss from 'fs-extra';
import { useSelector, useDispatch } from 'react-redux';
import path from 'path';
import Modal from '../components/Modal';
import { addToQueue } from '../reducers/actions';
import { _getInstancesPath, _getInstance } from '../utils/selectors';
import { closeModal } from '../reducers/modals/actions';
import { sortByForgeVersionDesc } from '../utils';

const McVersionChanger = ({ instanceName }) => {
  const vanillaManifest = useSelector(state => state.app.vanillaManifest);
  const fabricManifest = useSelector(state => state.app.fabricManifest);
  const forgeManifest = useSelector(state => state.app.forgeManifest);
  const config = useSelector(state => _getInstance(state)(instanceName));
  const instancePath = useSelector(state =>
    path.join(_getInstancesPath(state), instanceName)
  );

  const dispatch = useDispatch();

  const filteredVersions = useMemo(() => {
    const snapshots = vanillaManifest.versions
      .filter(v => v.type === 'snapshot')
      .map(v => v.id);
    const versions = [
      {
        value: 'vanilla',
        label: 'Vanilla',
        children: [
          {
            value: 'release',
            label: 'Releases',
            children: vanillaManifest.versions
              .filter(v => v.type === 'release')
              .map(v => ({
                value: v.id,
                label: v.id
              }))
          },
          {
            value: 'snapshot',
            label: 'Snapshots',
            children: vanillaManifest.versions
              .filter(v => v.type === 'snapshot')
              .map(v => ({
                value: v.id,
                label: v.id
              }))
          },
          {
            value: 'old_beta',
            label: 'Old Beta',
            children: vanillaManifest.versions
              .filter(v => v.type === 'old_beta')
              .map(v => ({
                value: v.id,
                label: v.id
              }))
          },
          {
            value: 'old_alpha',
            label: 'Old Alpha',
            children: vanillaManifest.versions
              .filter(v => v.type === 'old_alpha')
              .map(v => ({
                value: v.id,
                label: v.id
              }))
          }
        ]
      },
      {
        value: 'forge',
        label: 'Forge',
        children: Object.entries(forgeManifest).map(([k, v]) => ({
          value: k,
          label: k,
          children: v.sort(sortByForgeVersionDesc).map(child => ({
            value: child,
            label: child.split('-')[1]
          }))
        }))
      },
      {
        value: 'fabric',
        label: 'Fabric',
        children: [
          {
            value: 'release',
            label: 'Releases',
            children: fabricManifest.mappings
              .filter(v => !snapshots.includes(v.gameVersion))
              .map(v => ({
                value: v.version,
                label: v.version,
                children: fabricManifest.loader.map(c => ({
                  value: c.version,
                  label: c.version
                }))
              }))
          },
          {
            value: 'snapshot',
            label: 'Snapshots',
            children: fabricManifest.mappings
              .filter(v => snapshots.includes(v.gameVersion))
              .map(v => ({
                value: v.version,
                label: v.version,
                children: fabricManifest.loader.map(c => ({
                  value: c.version,
                  label: c.version
                }))
              }))
          }
        ]
      }
    ];
    return versions;
  }, [vanillaManifest, fabricManifest, forgeManifest]);

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
          options={filteredVersions}
          onChange={async v => {
            if (v[0] === 'vanilla') {
              dispatch(addToQueue(instanceName, [v[0], v[2]]));
            } else if (v[0] === 'forge') {
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
            } else if (v[0] === 'fabric') {
              dispatch(
                addToQueue(instanceName, [
                  'fabric',
                  v[2].split('+')[0],
                  v[2],
                  v[3]
                ])
              );
            }

            dispatch(closeModal());
            setTimeout(() => dispatch(closeModal()), 500);
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
