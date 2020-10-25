import React, { useState, useEffect, memo } from 'react';
import { transparentize } from 'polished';
import styled, { keyframes } from 'styled-components';
import { promises as fs } from 'fs';
import { LoadingOutlined } from '@ant-design/icons';
import path from 'path';
import { Portal } from 'react-portal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faClock,
  faWrench,
  faFolder,
  faTrash,
  faStop,
  faBoxOpen
} from '@fortawesome/free-solid-svg-icons';
import psTree from 'ps-tree';
import { ContextMenuTrigger, ContextMenu, MenuItem } from 'react-contextmenu';
import { useSelector, useDispatch } from 'react-redux';
import { _getInstancesPath } from '../../../../common/utils/selectors';
import { launchInstance } from '../../../../common/reducers/actions';
import { openModal } from '../../../../common/reducers/modals/actions';
import instanceDefaultBackground from '../../../../common/assets/instance_default.png';
import { convertMinutesToHumanTime } from '../../../../common/utils';
import { FABRIC, FORGE, VANILLA } from '../../../../common/utils/constants';
import sendMessage from '../../../../common/utils/sendMessage';
import EV from '../../../../common/messageEvents';

const Container = styled.div`
  position: relative;
  width: 180px;
  height: 100px;
  transform: ${p =>
    p.isHovered && !p.installing
      ? 'scale3d(1.1, 1.1, 1.1)'
      : 'scale3d(1, 1, 1)'};
  margin-right: 20px;
  margin-top: 20px;
  transition: transform 150ms ease-in-out;
  &:hover {
    ${p => (p.installing ? '' : 'transform: scale3d(1.1, 1.1, 1.1);')}
  }
`;

const Spinner = keyframes`
  0% {
    transform: translate3d(-50%, -50%, 0) rotate(0deg);
  }
  100% {
    transform: translate3d(-50%, -50%, 0) rotate(360deg);
  }
`;

const PlayButtonAnimation = keyframes`
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const InstanceContainer = styled.div`
  display: flex;
  position: absolute;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
  font-size: 20px;
  overflow: hidden;
  height: 100%;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)),
    url('${props => props.background}') center no-repeat;
  background-position: center;
  color: ${props => props.theme.palette.text.secondary};
  font-weight: 600;
  background-size: cover;
  border-radius: 4px;
  margin: 10px;
`;

const HoverContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 18px;
  margin: 10px;
  padding: 10px;
  text-align: center;
  font-weight: 800;
  border-radius: 4px;
  transition: opacity 150ms ease-in-out;
  width: 100%;
  height: 100%;
  opacity: ${p => (p.installing || p.isHovered ? '1' : '0')};
  backdrop-filter: blur(4px);
  will-change: opacity;
  background: ${p => transparentize(0.5, p.theme.palette.grey[800])};
  &:hover {
    opacity: 1;
  }

  .spinner:before {
    animation: 1.5s linear infinite ${Spinner};
    animation-play-state: inherit;
    border: solid 3px transparent;
    border-bottom-color: ${props => props.theme.palette.colors.yellow};
    border-radius: 50%;
    content: '';
    height: 30px;
    width: 30px;
    position: absolute;
    top: 10px;
    transform: translate3d(-50%, -50%, 0);
    will-change: transform;
  }
`;

const MCVersion = styled.div`
  position: absolute;
  right: 5px;
  top: 5px;
  font-size: 11px;
  color: ${props => props.theme.palette.text.third};
`;

const TimePlayed = styled.div`
  position: absolute;
  left: 5px;
  top: 5px;
  font-size: 11px;
  color: ${props => props.theme.palette.text.third};
`;

const MenuInstanceName = styled.div`
  background: ${props => props.theme.palette.grey[800]};
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: ${props => props.theme.palette.text.primary};
  padding: 0 20px;
  font-weight: 700;
`;

const Instance = ({
  isInstalling,
  installationProgress,
  installationStatus,
  isInQueue,
  instance
}) => {
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const [background, setBackground] = useState(`${instanceDefaultBackground}`);
  const startedInstances = useSelector(state => state.startedInstances);
  const instancesPath = useSelector(_getInstancesPath);

  const isPlaying = startedInstances[instance.name];

  useEffect(() => {
    if (instance.background) {
      fs.readFile(path.join(instancesPath, instance.name, instance.background))
        .then(res =>
          setBackground(`data:image/png;base64,${res.toString('base64')}`)
        )
        .catch(console.warning);
    } else {
      setBackground(`${instanceDefaultBackground}`);
    }
  }, [instance.background, instancesPath, instance.name]);

  const startInstance = () => {
    if (isInQueue || isPlaying) return;
    dispatch(launchInstance(instance.name));
  };
  const openFolder = () => {
    sendMessage(EV.OPEN_FOLDER, path.join(instancesPath, instance.name));
  };
  const openConfirmationDeleteModal = () => {
    dispatch(
      openModal('InstanceDeleteConfirmation', { instanceName: instance.name })
    );
  };
  const manageInstance = () => {
    dispatch(openModal('InstanceManager', { instanceName: instance.name }));
  };
  const instanceExportCurseForge = () => {
    dispatch(
      openModal('InstanceExportCurseForge', { instanceName: instance.name })
    );
  };
  const killProcess = () => {
    console.log(isPlaying.pid);
    psTree(isPlaying.pid, (err, children) => {
      if (children.length) {
        children.forEach(el => {
          process.kill(el.PID);
        });
      } else {
        process.kill(isPlaying.pid);
      }
    });
  };

  return (
    <>
      <ContextMenuTrigger id={instance.name}>
        <Container
          installing={isInQueue}
          onClick={startInstance}
          isHovered={isHovered || isPlaying}
        >
          <InstanceContainer installing={isInQueue} background={background}>
            <TimePlayed>
              <FontAwesomeIcon
                icon={faClock}
                css={`
                  margin-right: 5px;
                `}
              />

              {convertMinutesToHumanTime(instance.timePlayed)}
            </TimePlayed>
            <MCVersion>{(instance.modloader || [])[1]}</MCVersion>
            {instance.name}
          </InstanceContainer>
          <HoverContainer
            installing={isInQueue}
            isHovered={isHovered || isPlaying}
          >
            {isInstalling ? (
              <>
                <div
                  css={`
                    font-size: 14px;
                  `}
                >
                  {installationStatus}
                </div>
                {`${installationProgress}%`}
                <LoadingOutlined
                  css={`
                    position: absolute;
                    bottom: 8px;
                    right: 8px;
                  `}
                />
              </>
            ) : (
              <>
                {isPlaying && (
                  <div
                    css={`
                      position: relative;
                      width: 20px;
                      height: 20px;
                    `}
                  >
                    {isPlaying.initialized && (
                      <FontAwesomeIcon
                        css={`
                          color: ${({ theme }) => theme.palette.colors.green};
                          font-size: 27px;
                          position: absolute;
                          margin-left: -6px;
                          margin-top: -2px;
                          animation: ${PlayButtonAnimation} 0.5s
                            cubic-bezier(0.75, -1.5, 0, 2.75);
                        `}
                        icon={faPlay}
                      />
                    )}
                    {!isPlaying.initialized && <div className="spinner" />}
                  </div>
                )}
                {isInQueue && 'In Queue'}
                {!isInQueue && !isPlaying && 'PLAY'}
              </>
            )}
          </HoverContainer>
        </Container>
      </ContextMenuTrigger>
      <Portal>
        <ContextMenu
          id={instance.name}
          onShow={() => setIsHovered(true)}
          onHide={() => setIsHovered(false)}
        >
          <MenuInstanceName>{instance.name}</MenuInstanceName>
          {isPlaying && (
            <MenuItem onClick={killProcess}>
              <FontAwesomeIcon
                icon={faStop}
                css={`
                  margin-right: 10px;
                `}
              />
              Kill
            </MenuItem>
          )}
          <MenuItem disabled={Boolean(isInQueue)} onClick={manageInstance}>
            <FontAwesomeIcon
              icon={faWrench}
              css={`
                margin-right: 10px;
              `}
            />
            Manage
          </MenuItem>
          <MenuItem onClick={openFolder}>
            <FontAwesomeIcon
              icon={faFolder}
              css={`
                margin-right: 10px;
              `}
            />
            Open Folder
          </MenuItem>

          {/* // TODO - Support other export options besides curseforge forge. */}
          <MenuItem
            onClick={instanceExportCurseForge}
            disabled={
              Boolean(isInQueue) ||
              !(
                instance.modloader[0] === FORGE ||
                instance.modloader[0] === FABRIC ||
                instance.modloader[0] === VANILLA
              )
            }
          >
            <FontAwesomeIcon
              icon={faBoxOpen}
              css={`
                margin-right: 10px;
                width: 16px !important;
              `}
            />
            Export Pack
          </MenuItem>
          <MenuItem divider />
          <MenuItem
            disabled={Boolean(isInQueue) || Boolean(isPlaying)}
            onClick={openConfirmationDeleteModal}
          >
            <FontAwesomeIcon
              icon={faTrash}
              css={`
                margin-right: 10px;
              `}
            />
            Delete
          </MenuItem>
        </ContextMenu>
      </Portal>
    </>
  );
};

export default memo(Instance);
