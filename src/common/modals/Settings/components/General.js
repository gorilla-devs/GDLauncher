import React, { useState, useEffect, memo } from 'react';
import styled from 'styled-components';
import { ipcRenderer, clipboard } from 'electron';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { push } from 'connected-react-router';
import fsa from 'fs-extra';
import {
  faCopy,
  faDownload,
  faFolder,
  faUndoAlt,
  faTachometerAlt,
  faTrash,
  faPlay,
  faToilet,
  faNewspaper
} from '@fortawesome/free-solid-svg-icons';
import { Select, Tooltip, Button, Switch, Input } from 'antd';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import {
  _getCurrentAccount,
  _getDataStorePath,
  _getInstancesPath,
  _getTempPath
} from '../../../utils/selectors';
import {
  updateReleaseChannel,
  updateDiscordRPC,
  updateDataPath,
  updateHideWindowOnGameLaunch,
  updatePotatoPcMode,
  updateShowNews
} from '../../../reducers/settings/actions';
import HorizontalLogo from '../../../../ui/HorizontalLogo';
import { updateConcurrentDownloads } from '../../../reducers/actions';
import { extractFace } from '../../../../app/desktop/utils';

const MyAccountPrf = styled.div`
  width: 100%;
  height: 100%;
`;

const PersonalData = styled.div`
  margin-top: 38px;
  width: 100%;
`;

const MainTitle = styled.h1`
  color: ${props => props.theme.palette.text.primary};
  margin: 0 500px 20px 0;
  margin-bottom: 20px;
`;

const Title = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.palette.text.primary};
  z-index: 1;
  text-align: left;
`;

const ProfileImage = styled.img`
  position: relative;
  top: 20px;
  left: 20px;
  background: #212b36;
  width: 50px;
  height: 50px;
`;

const ImagePlaceHolder = styled.div`
  position: relative;
  top: 20px;
  left: 20px;
  background: #212b36;
  width: 50px;
  height: 50px;
`;

const UsernameContainer = styled.div`
  text-align: left;
`;

const UuidContainer = styled.div`
  text-align: left;
`;

const Username = styled.div`
  font-size: smaller;
  font-weight: 200;
  color: ${props => props.theme.palette.grey[100]};
`;

const Uuid = styled.div`
  font-size: smaller;
  font-weight: 200;
  color: ${props => props.theme.palette.grey[100]};
`;

const PersonalDataContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  background: ${props => props.theme.palette.grey[900]};
  border-radius: ${props => props.theme.shape.borderRadius};
`;

const Hr = styled.hr`
  opacity: 0.29;
  background: ${props => props.theme.palette.secondary.light};
`;

const ReleaseChannel = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  width: 100%;
  height: 90px;
  color: ${props => props.theme.palette.text.third};
  p {
    margin-bottom: 7px;
    color: ${props => props.theme.palette.text.secondary};
  }
  div {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  select {
    margin-left: auto;
    self-align: end;
  }
`;

const ParallelDownload = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 60px;
  p {
    text-align: left;
    color: ${props => props.theme.palette.text.third};
  }
`;

const DiscordRpc = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  height: 40px;
  p {
    text-align: left;
    color: ${props => props.theme.palette.text.third};
  }
`;

const OverridePath = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  p {
    text-align: left;
    color: ${props => props.theme.palette.text.third};
  }
`;

const DataPath = styled.div`
  width: 100%;
  height: 40px;
`;

const LauncherVersion = styled.div`
  margin: 30px 0;
  p {
    text-align: left;
    color: ${props => props.theme.palette.text.third};
    margin: 0 0 0 6px;
  }

  h1 {
    color: ${props => props.theme.palette.text.primary};
  }
`;

function copy(setCopied, copyText) {
  setCopied(true);
  clipboard.writeText(copyText);
  setTimeout(() => {
    setCopied(false);
  }, 500);
}

function dashUuid(UUID) {
  // UUID is segmented into: 8 - 4 - 4 - 4 - 12
  // Then dashes are added between.

  // eslint-disable-next-line
  return (
    `${
    UUID.substring(0, 8)}-${ 
    UUID.substring(8, 12)}-${ 
    UUID.substring(12, 16)}-${ 
    UUID.substring(16, 20)}-${ 
    UUID.substring(20, 32)}`
  );
  
}

const openFolderDialog = async (InstancesPath, dispatch) => {
  const paths = await ipcRenderer.invoke('openFolderDialog', InstancesPath);
  if (!paths.filePaths[0]) return;
  dispatch(updateDataPath(paths.filePaths[0]));
};

const General = () => {
  const [version, setVersion] = useState(null);
  const currentAccount = useSelector(_getCurrentAccount);
  const dataPath = useSelector(state => state.settings.dataPath);
  const releaseC = useSelector(state => state.settings.releaseChannel);
  const hideWindowOnGameLaunch = useSelector(
    state => state.settings.hideWindowOnGameLaunch
  );
  const DiscordRPC = useSelector(state => state.settings.discordRPC);
  const potatoPcMode = useSelector(state => state.settings.potatoPcMode);
  const concurrentDownloads = useSelector(
    state => state.settings.concurrentDownloads
  );
  const updateAvailable = useSelector(state => state.updateAvailable);
  const dataStorePath = useSelector(_getDataStorePath);
  const instancesPath = useSelector(_getInstancesPath);
  const isPlaying = useSelector(state => state.startedInstances);
  const queuedInstances = useSelector(state => state.downloadQueue);
  const tempPath = useSelector(_getTempPath);
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [deletingInstances, setDeletingInstances] = useState(false);
  const showNews = useSelector(state => state.settings.showNews);

  const dispatch = useDispatch();

  const disableInstancesActions =
    Object.keys(queuedInstances).length > 0 ||
    Object.keys(isPlaying).length > 0;

  useEffect(() => {
    ipcRenderer.invoke('getAppVersion').then(setVersion).catch(console.error);
    extractFace(currentAccount.skin).then(setProfileImage).catch(console.error);
  }, []);

  const clearSharedData = async () => {
    setDeletingInstances(true);
    try {
      await fsa.emptyDir(dataStorePath);
      await fsa.emptyDir(instancesPath);
      await fsa.emptyDir(tempPath);
    } catch (e) {
      console.error(e);
    }
    setDeletingInstances(false);
  };

  const resetDataPath = async () => {
    const appdataPath = await ipcRenderer.invoke('getUserDataPath');
    dispatch(updateDataPath(appdataPath));
  };

  return (
    <MyAccountPrf>
      <PersonalData>
        <MainTitle>General</MainTitle>
        <PersonalDataContainer>
          {profileImage ? (
            <ProfileImage src={`data:image/jpeg;base64,${profileImage}`} />
          ) : (
            <ImagePlaceHolder />
          )}
          <div
            css={`
              margin: 20px 20px 20px 40px;
              width: 330px;
            `}
          >
            <UsernameContainer>
              Username
              <br />
              <Username>
                {currentAccount.selectedProfile.name}{' '}
                <Tooltip
                  title={copiedUsername ? 'copied' : 'copy'}
                  placement="top"
                >
                  <div
                    css={`
                      width: 13px;
                      height: 14px;
                      margin: 0;
                      margin-left: 4px;
                      float: right;
                    `}
                  >
                    <FontAwesomeIcon
                      icon={faCopy}
                      onClick={() =>
                        copy(
                          setCopiedUsername,
                          currentAccount.selectedProfile.name
                        )
                      }
                    />
                  </div>
                </Tooltip>
              </Username>
            </UsernameContainer>
            <UuidContainer>
              UUID
              <br />
              <Uuid>
                {dashUuid(currentAccount.selectedProfile.id)}
                <Tooltip title={copiedUuid ? 'copied' : 'copy'} placement="top">
                  <div
                    css={`
                      width: 13px;
                      height: 14px;
                      margin: 0;
                      margin-left: 4px;
                      float: right;
                    `}
                  >
                    <FontAwesomeIcon
                      icon={faCopy}
                      onClick={() =>
                        copy(
                          setCopiedUuid,
                          dashUuid(currentAccount.selectedProfile.id)
                        )
                      }
                    />
                  </div>
                </Tooltip>
              </Uuid>
            </UuidContainer>
          </div>
        </PersonalDataContainer>
      </PersonalData>
      <Hr />
      <ReleaseChannel>
        <Title>Release Channel</Title>
        <div>
          <div
            css={`
              width: 400px;
            `}
          >
            Stable updates once a month, beta does update more often but it may
            have more bugs.
          </div>
          <Select
            css={`
              && {
                width: 100px;
              }
            `}
            onChange={e => {
              dispatch(updateReleaseChannel(e));
            }}
            value={releaseC}
            defaultValue={!releaseC ? 'Stable' : 'Beta'}
          >
            <Select.Option value="1">Beta</Select.Option>
            <Select.Option value="0">Stable</Select.Option>
          </Select>
        </div>
      </ReleaseChannel>
      <Hr />
      <Title>
        Concurrent Downloads &nbsp; <FontAwesomeIcon icon={faTachometerAlt} />
      </Title>
      <ParallelDownload>
        <p
          css={`
            margin: 0;
            width: 400px;
          `}
        >
          Select the number of concurrent downloads. If you have a slow
          connection, select max 3
        </p>

        <Select
          onChange={v => dispatch(updateConcurrentDownloads(v))}
          value={concurrentDownloads}
          css={`
            width: 100px;
          `}
        >
          {[...Array(20).keys()]
            .map(x => x + 1)
            .map(x => (
              <Select.Option value={x}>{x}</Select.Option>
            ))}
        </Select>
      </ParallelDownload>
      <Hr />
      <Title
        css={`
          margin-top: 0px;
        `}
      >
        Discord RPC &nbsp; <FontAwesomeIcon icon={faDiscord} />
      </Title>
      <DiscordRpc>
        <p
          css={`
            width: 350px;
          `}
        >
          Enable / disable Discord RPC
        </p>
        <Switch
          onChange={e => {
            dispatch(updateDiscordRPC(e));
            if (e) {
              ipcRenderer.invoke('init-discord-rpc');
            } else {
              ipcRenderer.invoke('shutdown-discord-rpc');
            }
          }}
          checked={DiscordRPC}
        />
      </DiscordRpc>
      <Hr />
      <Title
        css={`
          margin-top: 0px;
        `}
      >
        Minecraft News &nbsp; <FontAwesomeIcon icon={faNewspaper} />
      </Title>
      <DiscordRpc>
        <p
          css={`
            width: 350px;
          `}
        >
          Enable / disable Minecraft news.
        </p>
        <Switch
          onChange={e => {
            dispatch(updateShowNews(e));
          }}
          checked={showNews}
        />
      </DiscordRpc>
      <Hr />
      <Title
        css={`
          margin-top: 0px;
        `}
      >
        Hide Launcher While Playing &nbsp; <FontAwesomeIcon icon={faPlay} />
      </Title>
      <DiscordRpc
        css={`
          margin-bottom: 30px;
        `}
      >
        <p
          css={`
            width: 500px;
          `}
        >
          Automatically hide the launcher when launching an instance. You will
          still be able to open it from the icon tray
        </p>
        <Switch
          onChange={e => {
            dispatch(updateHideWindowOnGameLaunch(e));
          }}
          checked={hideWindowOnGameLaunch}
        />
      </DiscordRpc>
      <Hr />
      <Title
        css={`
          margin-top: 0px;
        `}
      >
        Potato PC Mode &nbsp; <FontAwesomeIcon icon={faToilet} />
      </Title>
      <DiscordRpc
        css={`
          margin-bottom: 30px;
        `}
      >
        <p
          css={`
            width: 500px;
          `}
        >
          You got a potato PC? Don&apos;t worry! We got you covered. Enable this
          and all animations and special effects will be disabled
        </p>
        <Switch
          onChange={e => {
            dispatch(updatePotatoPcMode(e));
          }}
          checked={potatoPcMode}
        />
      </DiscordRpc>
      <Hr />
      <Title
        css={`
          width: 300px;
          float: left;
        `}
      >
        Clear Shared Data&nbsp; <FontAwesomeIcon icon={faTrash} />
      </Title>
      <div
        css={`
          display: flex;
          justify-content: space-between;
          text-align: left;
          width: 100%;
          margin-bottom: 30px;
          p {
            text-align: left;
            color: ${props => props.theme.palette.text.third};
          }
        `}
      >
        <p
          css={`
            margin: 0;
            width: 500px;
          `}
        >
          Deletes all the shared files between instances. Doing this will result
          in the complete loss of the instances data
        </p>
        <Button
          onClick={clearSharedData}
          disabled={disableInstancesActions}
          loading={deletingInstances}
        >
          Clear
        </Button>
      </div>
      <Hr />
      <Title
        css={`
          width: 250px;
        `}
      >
        Data Path&nbsp; <FontAwesomeIcon icon={faFolder} />
      </Title>
      <OverridePath>
        <p
          css={`
            margin: 0;
            height: 40px;
            width: 100%;
          `}
        >
          Select a custom data path. Most of the launcher data will be stored
          here
        </p>
      </OverridePath>
      <DataPath>
        <div
          css={`
            margin-top: 20px;
            width: 100%;
            display: flex;

            input {
              margin-right: 5px;
            }

            button {
              margin: 0 5px;
            }
          `}
        >
          <Input
            onChange={e => dispatch(updateDataPath(e.target.value))}
            value={dataPath}
            disabled={disableInstancesActions}
          />
          <Button
            onClick={() => openFolderDialog(dataPath, dispatch)}
            disabled={disableInstancesActions}
          >
            <FontAwesomeIcon icon={faFolder} />
          </Button>
          <Button onClick={resetDataPath} disabled={disableInstancesActions}>
            <FontAwesomeIcon icon={faUndoAlt} />
          </Button>
        </div>
      </DataPath>
      <Hr />
      <LauncherVersion>
        <div
          css={`
            display: flex;
            justify-content: flex-start;
            align-items: center;
            margin: 10px 0;
          `}
        >
          <HorizontalLogo size={200} />{' '}
          <div
            css={`
              margin-left: 10px;
            `}
          >
            v {version}
          </div>
        </div>
        <p>
          {updateAvailable
            ? 'There is an update available to be installed. Click on update to install it and restart the launcher'
            : 'You’re currently on the latest version. We automatically check for updates and we will inform you whenever there is one'}
        </p>
        <div
          css={`
            margin-top: 20px;
            height: 36px;
            display: flex;
            flex-direction: row;
          `}
        >
          {updateAvailable ? (
            <Button
              onClick={() => dispatch(push('/autoUpdate'))}
              css={`
                && {
                  margin-right: 10px;
                }
              `}
              type="primary"
            >
              Update &nbsp;
              <FontAwesomeIcon icon={faDownload} />
            </Button>
          ) : (
            <div
              css={`
                width: 96px;
                height: 36px;
                padding: 6px 8px;
              `}
            >
              Up to date
            </div>
          )}
        </div>
      </LauncherVersion>
    </MyAccountPrf>
  );
};

export default memo(General);
