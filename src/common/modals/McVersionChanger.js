import React, { memo, useMemo, useState } from 'react';
import { Cascader } from 'antd';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLongArrowAltRight } from '@fortawesome/free-solid-svg-icons';
import path from 'path';
import { isEqual } from 'lodash';
import Modal from '../components/Modal';
import { addToQueue } from '../reducers/actions';
import { _getInstance } from '../utils/selectors';
import { closeAllModals } from '../reducers/modals/actions';
import { FABRIC, VANILLA, FORGE } from '../utils/constants';
import { getFilteredVersions } from '../../app/desktop/utils';

const McVersionChanger = ({ instanceName, defaultValue }) => {
  const vanillaManifest = useSelector(state => state.app.vanillaManifest);
  const fabricManifest = useSelector(state => state.app.fabricManifest);
  const forgeManifest = useSelector(state => state.app.forgeManifest);
  const config = useSelector(state => _getInstance(state)(instanceName));
  const [selectedVersion, setSelectedVersion] = useState(null);

  const dispatch = useDispatch();

  const filteredVers = useMemo(() => {
    return getFilteredVersions(vanillaManifest, forgeManifest, fabricManifest);
  }, [vanillaManifest, forgeManifest, fabricManifest]);

  const patchedDefaultValue = useMemo(() => {
    if (defaultValue[0] === FORGE) return defaultValue;
    const type = filteredVers.find(v => v.value === defaultValue[0]);
    for (const releaseType of type.children) {
      const match = releaseType.children.find(v => v.value === defaultValue[1]);
      if (match)
        return [defaultValue[0], releaseType.value, ...defaultValue.slice(1)];
    }
  }, [defaultValue, instanceName, filteredVers]);

  return (
    <Modal
      title="Minecraft Version Changer"
      css={`
        height: 380px;
        width: 600px;
      `}
      removePadding
    >
      <Container>
        <Cascader
          options={filteredVers}
          defaultValue={patchedDefaultValue}
          onChange={async version => {
            setSelectedVersion(version);
          }}
          placeholder="Select a version"
          size="large"
          css={`
            width: 400px;
          `}
        />
        <div
          css={`
            position: absolute;
            bottom: 20px;
            right: 20px;
          `}
        >
          <div
            isVersionDifferent={
              selectedVersion && !isEqual(patchedDefaultValue, selectedVersion)
            }
            css={`
              width: 70px;
              height: 40px;
              transition: 0.1s ease-in-out;
              display: flex;
              justify-content: center;
              align-items: center;
              border-radius: 4px;
              font-size: 40px;
              color: ${props =>
                props.isVersionDifferent
                  ? props.theme.palette.text.icon
                  : props.theme.palette.text.disabled};
              ${props => (props.isVersionDifferent ? 'cursor: pointer;' : '')}
              &:hover {
                background-color: ${props =>
                  props.isVersionDifferent
                    ? props.theme.action.hover
                    : 'transparent'};
              }
            `}
            onClick={async () => {
              if (
                !selectedVersion ||
                isEqual(patchedDefaultValue, selectedVersion)
              ) {
                return;
              }
              const background = config?.background
                ? `background${path.extname(config?.background)}`
                : null;

              const isVanilla = selectedVersion[0] === VANILLA;
              const isFabric = selectedVersion[0] === FABRIC;
              const isForge = selectedVersion[0] === FORGE;
              if (isVanilla) {
                dispatch(
                  addToQueue(
                    instanceName,
                    [selectedVersion[0], selectedVersion[2]],
                    null,
                    background
                  )
                );
              } else if (isForge) {
                dispatch(
                  addToQueue(instanceName, selectedVersion, null, background)
                );
              } else if (isFabric) {
                dispatch(
                  addToQueue(
                    instanceName,
                    [FABRIC, selectedVersion[2], selectedVersion[3]],
                    null,
                    background
                  )
                );
              }

              dispatch(closeAllModals());
            }}
          >
            <FontAwesomeIcon icon={faLongArrowAltRight} />
          </div>
        </div>
      </Container>
    </Modal>
  );
};

export default memo(McVersionChanger);

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;
