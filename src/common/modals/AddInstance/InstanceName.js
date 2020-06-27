/* eslint-disable */
import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import path from 'path';
import fse from 'fs-extra';
import { useSelector, useDispatch } from 'react-redux';
import { Transition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faLongArrowAltLeft,
  faLongArrowAltRight
} from '@fortawesome/free-solid-svg-icons';
import { Input } from 'antd';
import { transparentize } from 'polished';
import { addToQueue } from '../../reducers/actions';
import { closeModal } from '../../reducers/modals/actions';
import {
  downloadAddonZip,
  importAddonZip,
  convertcurseForgeToCanonical
} from '../../../app/desktop/utils';
import { _getInstancesPath, _getTempPath } from '../../utils/selectors';
import bgImage from '../../assets/mcCube.jpg';
import { downloadFile } from '../../../app/desktop/utils/downloader';
import { FABRIC, VANILLA, FORGE } from '../../utils/constants';

const InstanceName = ({
  in: inProp,
  setStep,
  version,
  modpack,
  setVersion,
  setModpack,
  importZipPath,
  step
}) => {
  const mcName = (
    modpack?.name.replace(/\W/g, ' ') ||
    (version && `Minecraft ${version[0]}`) ||
    ''
  ).trim();
  const originalMcName =
    modpack?.name || (version && `Minecraft ${version[0]}`);
  const dispatch = useDispatch();
  const instancesPath = useSelector(_getInstancesPath);
  const tempPath = useSelector(_getTempPath);
  const forgeManifest = useSelector(state => state.app.forgeManifest);
  const [instanceName, setInstanceName] = useState(mcName);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [invalidName, setInvalidName] = useState(true);
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (instanceName || mcName) {
      const regex = /^[\sa-zA-Z0-9_.-]+$/;
      const finalWhiteSpace = /[^\s]$/;
      if (
        !regex.test(instanceName || mcName) ||
        !finalWhiteSpace.test(instanceName || mcName) ||
        (instanceName || mcName).length >= 35
      ) {
        setInvalidName(true);
        setAlreadyExists(false);
        return;
      }
      fse
        .pathExists(path.join(instancesPath, instanceName || mcName))
        .then(exists => {
          setAlreadyExists(exists);
          setInvalidName(false);
        });
    }
  }, [instanceName, step]);

  const thumbnailURL = modpack?.attachments?.find(v => v.isDefault)
    ?.thumbnailUrl;
  const imageURL = modpack?.attachments?.find(v => v.isDefault)?.thumbnailUrl;

  const wait = s => {
    return new Promise(resolve => {
      setTimeout(() => resolve(), s * 1000);
    });
  };

  const createInstance = async localInstanceName => {
    if (!version || !localInstanceName) return;
    const isVanilla = version[0] === VANILLA;
    const isFabric = version[0] === FABRIC;
    const isForge = version[0] === FORGE;
    const isTwitchModpack = Boolean(modpack?.attachments);
    let manifest;
    if (isTwitchModpack) {
      if (importZipPath) {
        manifest = await importAddonZip(
          importZipPath,
          path.join(instancesPath, localInstanceName),
          path.join(tempPath, localInstanceName),
          tempPath
        );
      } else {
        manifest = await downloadAddonZip(
          version[1],
          version[2],
          path.join(instancesPath, localInstanceName),
          path.join(tempPath, localInstanceName)
        );
      }
      await downloadFile(
        path.join(
          instancesPath,
          localInstanceName,
          `background${path.extname(imageURL)}`
        ),
        imageURL
      );
      if (version[0] === FORGE) {
        const modloader = [
          version[0],
          manifest.minecraft.version,
          convertcurseForgeToCanonical(
            manifest.minecraft.modLoaders.find(v => v.primary).id,
            manifest.minecraft.version,
            forgeManifest
          ),
          version[1],
          version[2]
        ];
        dispatch(
          addToQueue(
            localInstanceName,
            modloader,
            manifest,
            `background${path.extname(imageURL)}`
          )
        );
      } else if (version[0] === FABRIC) {
        const modloader = [
          version[0],
          manifest.minecraft.version,
          manifest.minecraft.modLoaders[0].yarn,
          manifest.minecraft.modLoaders[0].loader,
          version[1],
          version[2]
        ];
        dispatch(
          addToQueue(
            localInstanceName,
            modloader,
            manifest,
            `background${path.extname(imageURL)}`
          )
        );
      } else if (version[0] === VANILLA) {
        const modloader = [
          version[0],
          manifest.minecraft.version,
          version[1],
          version[2]
        ];
        dispatch(
          addToQueue(
            localInstanceName,
            modloader,
            manifest,
            `background${path.extname(imageURL)}`
          )
        );
      }
    } else if (importZipPath) {
      manifest = await importAddonZip(
        importZipPath,
        path.join(instancesPath, localInstanceName),
        path.join(tempPath, localInstanceName),
        tempPath
      );

      if (version[0] === FORGE) {
        const modloader = [
          version[0],
          manifest.minecraft.version,
          convertcurseForgeToCanonical(
            manifest.minecraft.modLoaders.find(v => v.primary).id,
            manifest.minecraft.version,
            forgeManifest
          )
        ];
        dispatch(addToQueue(localInstanceName, modloader, manifest));
      } else if (version[0] === FABRIC) {
        const modloader = [
          version[0],
          manifest.minecraft.version,
          manifest.minecraft.modLoaders[0].yarn,
          manifest.minecraft.modLoaders[0].loader
        ];
        dispatch(addToQueue(localInstanceName, modloader, manifest));
      } else if (version[0] === VANILLA) {
        const modloader = [version[0], manifest.minecraft.version];
        dispatch(addToQueue(localInstanceName, modloader, manifest));
      }
    } else if (isVanilla) {
      dispatch(addToQueue(localInstanceName, [version[0], version[2]]));
      await wait(2);
    } else if (isFabric) {
      dispatch(addToQueue(localInstanceName, [FABRIC, version[2], version[3]]));
      await wait(2);
    } else if (isForge) {
      dispatch(addToQueue(localInstanceName, version));
      await wait(2);
    }
    dispatch(closeModal());
  };
  return (
    <Transition in={inProp} timeout={200}>
      {state => (
        <Animation state={state} bg={thumbnailURL || bgImage}>
          <Transition in={clicked} timeout={200}>
            {state1 => (
              <>
                <BackgroundOverlay />
                <div
                  state={state1}
                  css={`
                    opacity: ${({ state }) =>
                      state === 'entering' || state === 'entered' ? 0 : 1};
                    flex: 1;
                    transition: 0.1s ease-in-out;
                    display: flex;
                    justify-content: center;
                    border-radius: 4px;
                    font-size: 40px;
                    cursor: pointer;
                    z-index: 100001;
                    margin: 20px;
                    &:hover {
                      background-color: ${props => props.theme.action.hover};
                    }
                  `}
                  onClick={() => {
                    setStep(0);
                  }}
                >
                  {clicked ? '' : <FontAwesomeIcon icon={faLongArrowAltLeft} />}
                </div>
                <div
                  css={`
                    position: relative;
                    flex: 10;
                    align-self: center;
                    font-size: 30px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    z-index: 100001;
                  `}
                >
                  <ModpackName state={state1} name={mcName}>
                    {originalMcName}
                  </ModpackName>
                  <div
                    css={`
                      margin-top: 150px;
                      display: flex;
                      flex-direction: column;
                      justify-content: center;
                    `}
                  >
                    <Input
                      state={state1}
                      size="large"
                      placeholder={mcName}
                      onChange={e => setInstanceName(e.target.value)}
                      css={`
                        opacity: ${({ state }) =>
                          state === 'entering' || state === 'entered' ? 0 : 1};
                        transition: 0.1s ease-in-out;
                        width: 300px;
                        align-self: center;
                      `}
                    />
                    <div
                      show={invalidName || alreadyExists}
                      css={`
                        opacity: ${props => (props.show ? 1 : 0)};
                        color: ${props => props.theme.palette.error.main};
                        font-weight: 700;
                        font-size: 14px;
                        padding: 3px;
                        height: 30px;
                        margin-top: 10px;
                        text-align: center;
                        border-radius: ${props =>
                          props.theme.shape.borderRadius};
                        background: ${props =>
                          transparentize(0.7, props.theme.palette.grey[700])};
                      `}
                    >
                      {invalidName &&
                        'Instance name is not valid or too long. Please try another one'}
                      {alreadyExists &&
                        'An instance with this name already exists!'}
                    </div>
                  </div>
                </div>
                <div
                  state={state1}
                  css={`
                    opacity: ${({ state }) =>
                      state === 'entering' || state === 'entered' ? 0 : 1};
                    flex: 1;
                    transition: 0.1s ease-in-out;
                    display: flex;
                    justify-content: center;
                    border-radius: 4px;
                    font-size: 40px;
                    cursor: pointer;
                    z-index: 100001;
                    margin: 20px;
                    &:hover {
                      background-color: ${props => props.theme.action.hover};
                    }
                  `}
                  onClick={() => {
                    createInstance(instanceName || mcName);
                    setClicked(true);
                  }}
                >
                  {clicked || alreadyExists || invalidName ? (
                    ''
                  ) : (
                    <FontAwesomeIcon icon={faLongArrowAltRight} />
                  )}
                </div>
              </>
            )}
          </Transition>
        </Animation>
      )}
    </Transition>
  );
};

export default React.memo(InstanceName);

const Animation = styled.div`
  transition: 0.2s ease-in-out;
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 100000;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  top: 0;
  left: 0;
  background: url(${props => props.bg});
  background-repeat: no-repeat;
  background-size: cover;
  will-change: transform;
  transform: translateX(
    ${({ state }) => (state === 'entering' || state === 'entered' ? 0 : 101)}%
  );
`;

const BackgroundOverlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(12px);
  background: ${props => transparentize(0.4, props.theme.palette.grey[900])};
`;

const ModpackNameKeyframe = props => keyframes`
  from {
    transform: scale(1) translateY(0);
  }

  35% {
    transform: scale(1) translateY(65%);
  }

  to {
    transform: scale(${props.name.length < 17 ? 2 : 1}) translateY(65%);
  }
`;

const ModpackNameBorderKeyframe = keyframes`
  0% {
    width: 0;
    height: 0;
  }
  25% {
    width: 100%;
    height: 0;
  }
  50% {
    width: 100%;
    height: 100%;
  }
  100% {
    width: 100%;
    height: 100%;
  }
`;

const ModpackNameBorderColorKeyframe = keyframes`
  0% {
    border-bottom-color: white;
    border-left-color: white;
  }
  50% {
    border-bottom-color: white;
    border-left-color: white;
  }
  51% {
    border-bottom-color: transparent;
    border-left-color: transparent;
  }
  100% {
    border-bottom-color: transparent;
    border-left-color: transparent;
  }
`;

const ModpackName = styled.span`
  position: relative;
  font-weight: bold;
  font-size: 45px;
  animation: ${({ state }) =>
      state === 'entering' || state === 'entered' ? ModpackNameKeyframe : null}
    0.2s ease-in-out forwards;
  box-sizing: border-box;
  text-align: center;
  overflow: hidden;
  text-transform: capitalize;
  padding: 20px;
  &:before,
  &:after {
    content: '';
    box-sizing: border-box;
    position: absolute;
    border: ${({ state }) =>
        state === 'entering' || state === 'entered' ? 4 : 0}px
      solid transparent;
    width: 0;
    height: 0;
  }
  &::before {
    top: 0;
    left: 0;
    border-top-color: white;
    border-right-color: white;
    animation: ${({ state }) =>
        state === 'entering' || state === 'entered'
          ? ModpackNameBorderKeyframe
          : null}
      2s infinite;
  }
  &::after {
    bottom: 0;
    right: 0;
    animation: ${({ state }) =>
          state === 'entering' || state === 'entered'
            ? ModpackNameBorderKeyframe
            : null}
        2s 1s infinite,
      ${({ state }) =>
          state === 'entering' || state === 'entered'
            ? ModpackNameBorderColorKeyframe
            : null}
        2s 1s infinite;
  }
`;
