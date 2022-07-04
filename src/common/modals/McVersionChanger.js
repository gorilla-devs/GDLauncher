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
import { FABRIC, VANILLA, FORGE, CURSEFORGE, FTB } from '../utils/constants';
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
    const isFabric = defaultValue?.loaderType === FABRIC;
    const isForge = defaultValue?.loaderType === FORGE;

    if (isForge)
      return [
        defaultValue?.loaderType,
        defaultValue?.mcVersion,
        defaultValue?.loaderVersion
      ];

    const type = filteredVers.find(v => v.value === defaultValue?.loaderType);
    for (const releaseType of type.children) {
      const match = releaseType.children.find(
        v => v.value === defaultValue?.mcVersion
      );
      if (match) {
        return [
          defaultValue?.loaderType,
          releaseType.value,
          ...(isFabric
            ? [defaultValue?.mcVersion, defaultValue?.loaderVersion]
            : [defaultValue?.mcVersion])
        ];
      }
    }
    return defaultValue;
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
        {selectedVersion &&
          selectedVersion[0] !== patchedDefaultValue[0] &&
          (defaultValue?.source === CURSEFORGE ||
            defaultValue?.source === FTB) && (
            <div
              css={`
                color: ${props => props.theme.palette.colors.yellow};
                font-weight: 900;
                width: 400px;
                text-align: center;
                margin-bottom: 30px;
                margin-top: -50px;
              `}
            >
              <div
                css={`
                  font-size: 20px;
                  margin-bottom: 10px;
                `}
              >
                DISCLAIMER
              </div>
              <div>
                Changing modloader (forge -&gt; fabric...) will result in the
                loss of the modpack metadata. You won&apos;t be able to change
                the modpack version or recognize this instance as a modpack
                anymore.
              </div>
            </div>
          )}
        <Cascader
          options={filteredVers}
          defaultValue={patchedDefaultValue}
          onChange={setSelectedVersion}
          allowClear={false}
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
                    {
                      ...defaultValue,
                      loaderType: selectedVersion[0],
                      mcVersion: selectedVersion[2]
                    },
                    null,
                    background
                  )
                );
              } else if (isForge) {
                dispatch(
                  addToQueue(
                    instanceName,
                    {
                      ...defaultValue,
                      loaderType: FORGE,
                      mcVersion: selectedVersion[1],
                      loaderVersion: selectedVersion[2]
                    },
                    null,
                    background
                  )
                );
              } else if (isFabric) {
                dispatch(
                  addToQueue(
                    instanceName,
                    {
                      ...defaultValue,
                      loaderType: FABRIC,
                      mcVersion: selectedVersion[2],
                      loaderVersion: selectedVersion[3]
                    },
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
  flex-direction: column;
`;
