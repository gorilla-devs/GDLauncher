import React, { useState, useEffect } from 'react';
import { transparentize } from 'polished';
import styled, { keyframes } from 'styled-components';
import { promises as fs } from 'fs';
import { LoadingOutlined } from '@ant-design/icons';
import path from 'path';
import { ipcRenderer } from 'electron';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faClock } from '@fortawesome/free-solid-svg-icons';
import psTree from 'ps-tree';
import { ContextMenuTrigger, ContextMenu, MenuItem } from 'react-contextmenu';
import { useSelector, useDispatch } from 'react-redux';
import {
  _getInstance,
  _getInstancesPath,
  _getDownloadQueue
} from '../../../../common/utils/selectors';
import { launchInstance } from '../../../../common/reducers/actions';
import { openModal } from '../../../../common/reducers/modals/actions';
import instanceDefaultBackground from '../../../../common/assets/instance_default.png';

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
  background: linear-gradient(0deg,rgba(0,0,0,0.8),rgba(0,0,0,0.8)),url("${props =>
    props.background}") center no-repeat;
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
    border-bottom-color: ${props => props.theme.palette.colors.green};
    border-radius: 50%;
    content: '';
    height: 60px;
    width: 60px;
    position: absolute;
    top: 13px;
    left: 9px;
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
  background: ${props => props.theme.palette.grey[900]};
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: ${props => props.theme.palette.text.primary};
  padding: 0 20px;
  font-weight: 700;
`;

const Instance = ({ instanceName }) => {
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);
  const [background, setBackground] = useState(`${instanceDefaultBackground}`);
  const instance = useSelector(state => _getInstance(state)(instanceName));
  const downloadQueue = useSelector(_getDownloadQueue);
  const currentDownload = useSelector(state => state.currentDownload);
  const startedInstances = useSelector(state => state.startedInstances);
  const instancesPath = useSelector(_getInstancesPath);
  const isInQueue = downloadQueue[instanceName];

  const isPlaying = startedInstances[instanceName];

  useEffect(() => {
    if (instance.background) {
      fs.readFile(path.join(instancesPath, instanceName, instance.background))
        .then(res =>
          setBackground(`data:image/png;base64,${res.toString('base64')}`)
        )
        .catch(console.warning);
    } else {
      setBackground(`${instanceDefaultBackground}`);
    }
  }, [instance.background, instancesPath, instanceName]);

  const startInstance = () => {
    if (isInQueue || isPlaying) return;
    dispatch(launchInstance(instanceName));
  };
  const openFolder = () => {
    ipcRenderer.invoke('openFolder', path.join(instancesPath, instance.name));
  };
  const openConfirmationDeleteModal = () => {
    dispatch(openModal('InstanceDeleteConfirmation', { instanceName }));
  };
  const manageInstance = () => {
    dispatch(openModal('InstanceManager', { instanceName }));
  };
  const killProcess = () => {
    psTree(isPlaying.pid, (err, children) => {
      children.forEach(el => {
        process.kill(el.PID);
      });
    });
  };

  return (
    <>
      <ContextMenuTrigger id={instanceName}>
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
              {instance.timePlayed} minutes
            </TimePlayed>
            <MCVersion>{(instance.modloader || [])[1]}</MCVersion>
            {instanceName}
          </InstanceContainer>
          <HoverContainer
            installing={isInQueue}
            isHovered={isHovered || isPlaying}
          >
            {currentDownload === instanceName ? (
              <>
                <div
                  css={`
                    font-size: 14px;
                  `}
                >
                  {isInQueue ? isInQueue.status : null}
                </div>
                {`${isInQueue.percentage}%`}
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
                      margin-top: -8px;
                    `}
                  >
                    <FontAwesomeIcon
                      css={`
                        color: ${({ theme }) => theme.palette.colors.green};
                        font-size: 27px;
                        position: absolute;
                      `}
                      icon={faPlay}
                    />
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
      <ContextMenu
        id={instance.name}
        onShow={() => setIsHovered(true)}
        onHide={() => setIsHovered(false)}
      >
        <MenuInstanceName>{instanceName}</MenuInstanceName>
        {isPlaying && <MenuItem onClick={killProcess}>Kill</MenuItem>}
        <MenuItem disabled={Boolean(isInQueue)} onClick={manageInstance}>
          Manage
        </MenuItem>
        <MenuItem onClick={openFolder}>Open Folder</MenuItem>
        <MenuItem divider />
        <MenuItem
          disabled={Boolean(isInQueue) || Boolean(isPlaying)}
          onClick={openConfirmationDeleteModal}
        >
          Delete
        </MenuItem>
      </ContextMenu>
    </>
  );
};

export default Instance;
